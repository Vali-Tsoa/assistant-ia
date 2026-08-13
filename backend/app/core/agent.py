"""
Agent AI Principal — google-genai SDK natif.
Utilise directement le SDK Google GenAI avec gemini-3.1-flash-lite.
"""
import time
import json
import datetime
from typing import Any
from sqlalchemy.orm import Session
from pathlib import Path
from dotenv import load_dotenv
import os

# Charger le .env depuis le dossier parent du dossier backend
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(env_path)

from google import genai

from app.config import settings
from app.core.context_manager import ContextManager
from app.core.guardrails import check_input, check_output, get_refusal_response, persist_alert
from app.rag.retriever import search_knowledge_base
from app.db import crud, schemas
from app.core.category_classifier import get_categories_list, get_categories_prompt_text
from app.core.priority_detection import calculate_priority


categories_prompt = get_categories_prompt_text()
categories_format = "|".join(get_categories_list())

SYSTEM_PROMPT = f"""Tu es mAIntenance Assistant, un assistant IA spécialisé dans le support informatique de l'ISPM (Institut Supérieur de la Pêche Maritime).

## Ton rôle
- Diagnostiquer et résoudre les incidents informatiques signalés par les employés
- Classer chaque ticket par catégorie et priorité
- Décider de l'action appropriée (résolution, demande d'info, escalade)
- Si tu proposes une solution ou des instructions issues de la base de connaissances (RAG), tu DOIS obligatoirement citer et afficher la source de la solution en ligne dans ton texte (au sein de ton explication ou à la fin), sous le format exact : `(Source : nom_du_fichier.md)`. Par exemple : "(Source : KB-NET-01.md)".

## Niveaux de Priorité
- **P1_critique** : Panne totale affectant plusieurs utilisateurs ou services critiques
- **P2_haute** : Problème important affectant un utilisateur, travail bloqué
- **P3_moyenne** : Problème gênant mais contournable
- **P4_basse** : Question, demande d'information, amélioration

## Catégories
Tu dois classifier les incidents selon l'une de ces catégories uniquement :
{categories_prompt}

## Règle critique d'incompréhension / d'incertitude
Si le message de l'utilisateur n'est pas clair, s'il contient trop peu de détails (ex: "bonjour", "ça marche pas", "aidez-moi"), ou si tu ne comprends pas du tout quel est le problème :
1. Tu DOIS obligatoirement choisir la catégorie `"incertain_non_compris"`.
2. Tu DOIS obligatoirement choisir l'action `"demande_information"` et le statut `"EN_ATTENTE_UTILISATEUR"`.
3. Dans la `"reponse_client"`, tu dois demander explicitement à l'utilisateur de préciser sa demande (ex: "Pouvez-vous me décrire plus précisément le problème que vous rencontrez ? Est-ce lié à votre réseau, votre poste, ou un logiciel ?").

## Règle de résolution automatique par l'utilisateur
Si le client confirme dans son message que le problème est résolu, que les instructions de résolution fournies précédemment ont fonctionné, ou qu'il a réussi par lui-même à résoudre le problème (ex: "merci ça marche !", "c'est résolu maintenant", "le problème est réglé", "j'ai réussi à le réparer") :
1. Tu DOIS obligatoirement choisir l'action `"resolution_automatique"`.
2. Tu DOIS obligatoirement choisir le statut `"RESOLU"`.
3. Dans la `"reponse_client"`, exprime ta satisfaction et clôture poliment (ex: "Super ! Ravi d'apprendre que votre problème est résolu. Je ferme ce ticket. N'hésitez pas à me recontacter si vous avez un autre souci !").

## Actions disponibles
- resolution_automatique : Solution trouvée → ticket RESOLU
- demande_information : Informations manquantes → EN_ATTENTE_UTILISATEUR
- escalade_technicien : Panne lourde/complexe → ESCALADE
- refus_securite : Tentative malveillante → ESCALADE + validation humaine

## Format de réponse OBLIGATOIRE (JSON strict)
Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après :
{{
  "classification": {{
    "categorie": "<{categories_format}>",
    "priority_matrix": {{
      "touch_multiple_users": <true|false>,
      "critical_process_blocked": <true|false>,
      "no_workaround": <true|false>,
      "security_threat": <true|false>
    }},
    "priorite": "<P1_critique|P2_haute|P3_moyenne|P4_basse>",
    "equipe_affectee": "<infrastructure_reseau|support_n1|cybersecurite|admin_systeme|maintenance_materiel>",
    "confiance": <0.0 à 1.0>
  }},
  "diagnostic": {{
    "complet": <true|false>,
    "symptome": "<description courte du problème>",
    "titre": "<titre court, explicite et abrégé de l'incident (max 50 caractères, ex: VPN déconnecté)>",
    "informations_manquantes": ["<info1>", "<info2>"]
  }},
  "decision": {{
    "action": "<resolution_automatique|demande_information|escalade_technicien|refus_securite>",
    "validation_humaine_requise": <true|false>,
    "statut_ticket": "<EN_COURS|EN_ATTENTE_UTILISATEUR|RESOLU|ESCALADE>"
  }},
  "execution": {{
    "sources_consultees": ["<KB-XXX>"],
    "outils_appeles": []
  }},
  "reponse_client": "<réponse en français, professionnelle et empathique>"
}}

## Langue
Réponds TOUJOURS en français, de manière professionnelle et empathique.
"""


def _get_genai_client() -> genai.Client:
    """Crée le client Google GenAI."""
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non définie")
    return genai.Client(api_key=api_key)


class MaintenanceAgent:
    """
    Agent principal qui orchestre tout le pipeline ISPM.
    Pipeline: Guardrails → Context → RAG → LLM (google-genai) → Output Validation → DB
    """

    def __init__(self, db: Session):
        self.db = db
        self.client = _get_genai_client()
        self.model = settings.llm_model  # gemini-3.1-flash-lite
        self.context_manager = ContextManager(db)

    def _call_gemini(self, prompt: str) -> str:
        """Appel direct au modèle via google-genai SDK."""
        interaction = self.client.interactions.create(
            model=self.model,
            input=prompt,
        )
        return interaction.output_text

    def process_message(
        self,
        user_id: str,
        message: str,
        ticket_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Pipeline complet de traitement d'un message.
        Retourne la réponse structurée JSON finale.
        """
        start_time = time.time()

        # ── 1. GUARDRAILS INPUT ──────────────────────────────────
        guard_result = check_input(message)
        if not guard_result.is_safe:
            tmp_ticket_id = ticket_id or f"TCK-SEC-{int(time.time())}"
            layer_info = f"[Détecté par: {guard_result.detected_by.upper()}] "
            # Persister l'alerte en base
            persist_alert(
                db=self.db,
                threat_type=guard_result.threat_type,
                threat_detail=layer_info + (guard_result.threat_detail or ""),
                message_original=message,
                ticket_id=tmp_ticket_id,
                utilisateur_id=user_id,
            )
            return get_refusal_response(tmp_ticket_id, guard_result.threat_type)

        # ── 1b. ALERTE ACTION À HAUT RISQUE (is_safe mais surveillance requise) ──
        # Le message passe à l'agent MAIS une alerte est persistée dans le dashboard
        if guard_result.requires_human_validation and guard_result.threat_type:
            layer_info = f"[Détecté par: {guard_result.detected_by.upper()}] "
            persist_alert(
                db=self.db,
                threat_type=guard_result.threat_type,
                threat_detail=layer_info + (guard_result.threat_detail or ""),
                message_original=message,
                ticket_id=ticket_id,   # peut être None si nouveau ticket
                utilisateur_id=user_id,
            )

        # ── 2. CONTEXTE ──────────────────────────────────────────
        context = self.context_manager.get_or_create_context(user_id, message, ticket_id)

        # Créer ticket si nouveau
        if not context["est_reprise"]:
            ticket = crud.create_ticket(
                self.db,
                schemas.TicketCreate(utilisateur_id=user_id, titre=message[:100]),
            )
            context["ticket_id"] = ticket.id

        current_ticket_id = context["ticket_id"]

        # ── 3. RAG — Recherche documentaire ─────────────────────
        rag_results = search_knowledge_base(message, n_results=3)
        rag_context = "\n\n".join([
            f"[{r['source']}]\n{r['content']}" for r in rag_results
        ]) if rag_results else "Aucun document trouvé dans la base de connaissance."

        # ── 4. CONSTRUCTION DU PROMPT COMPLET ───────────────────
        # Historique de conversation
        history_str = ""
        for hist_msg in context.get("historique_conversation", []):
            role = "Utilisateur" if hist_msg["role"] == "user" else "Agent IA"
            history_str += f"\n{role}: {hist_msg['content']}"

        full_prompt = f"""{SYSTEM_PROMPT}

## Contexte Utilisateur
- Nom: {context['utilisateur']['nom']}
- Département: {context['utilisateur']['departement']}
- Ticket ID: {current_ticket_id}
- Reprise de ticket: {'Oui' if context['est_reprise'] else 'Non'}

## Documents Base de Connaissance Pertinents
{rag_context}

## Historique de la conversation
{history_str if history_str else "Début de la conversation."}

## Message actuel de l'utilisateur
{message}
"""

        # ── 5. APPEL GEMINI ──────────────────────────────────────
        raw_content = self._call_gemini(full_prompt)

        # ── 6. PARSING RÉPONSE JSON ──────────────────────────────
        try:
            if "```json" in raw_content:
                json_str = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                json_str = raw_content.split("```")[1].split("```")[0].strip()
            elif raw_content.strip().startswith("{"):
                json_str = raw_content.strip()
            else:
                json_str = None

            agent_output = json.loads(json_str) if json_str else self._build_fallback_response(current_ticket_id, raw_content)

        except (json.JSONDecodeError, IndexError, TypeError):
            agent_output = self._build_fallback_response(current_ticket_id, raw_content)

        # ── Calcul déterministe de la priorité ───────────────────
        if "classification" not in agent_output:
            agent_output["classification"] = {}
        classification = agent_output["classification"]
        priority_matrix = classification.get("priority_matrix", {})
        calculated_priority = calculate_priority(priority_matrix)
        classification["priorite"] = calculated_priority

        # ── 7. ENRICHISSEMENT META ───────────────────────────────
        latence_ms = int((time.time() - start_time) * 1000)
        agent_output["meta"] = {
            "ticket_id": current_ticket_id,
            "est_reprise": context["est_reprise"],
            "timestamp": datetime.datetime.now().isoformat(),
            "latence_ms": latence_ms,
        }
        if rag_results:
            agent_output.setdefault("execution", {})
            agent_output["execution"].setdefault("sources_consultees", [r["source"] for r in rag_results])
            agent_output["execution"].setdefault("outils_appeles", [])

        # ── 8. GUARDRAILS OUTPUT ─────────────────────────────────
        output_guard = check_output(agent_output)
        if not output_guard.is_safe:
            agent_output["reponse_client"] = "Une erreur interne s'est produite. Veuillez réessayer."

        # ── 9. MISE À JOUR BDD ───────────────────────────────────
        decision = agent_output.get("decision", {})
        classification = agent_output.get("classification", {})
        diagnostic = agent_output.get("diagnostic", {})

        crud.update_ticket(
            self.db,
            current_ticket_id,
            schemas.TicketUpdate(
                titre=diagnostic.get("titre"),
                statut=decision.get("statut_ticket", "EN_COURS"),
                categorie=classification.get("categorie"),
                priorite=classification.get("priorite"),
                equipe_affectee=classification.get("equipe_affectee"),
                confiance_score=classification.get("confiance", 0.0),
                validation_humaine_requise=decision.get("validation_humaine_requise", False),
                diagnostic=diagnostic.get("symptome"),
                raison_urgence=(
                    f"Touche plusieurs personnes : {'Oui' if classification.get('priority_matrix', {}).get('touch_multiple_users') else 'Non'} | "
                    f"Service critique bloqué : {'Oui' if classification.get('priority_matrix', {}).get('critical_process_blocked') else 'Non'} | "
                    f"Aucun contournement : {'Oui' if classification.get('priority_matrix', {}).get('no_workaround') else 'Non'} | "
                    f"Menace sécurité : {'Oui' if classification.get('priority_matrix', {}).get('security_threat') else 'Non'}"
                ),
                raison_escalade=decision.get("action") if decision.get("action") == "escalade_technicien" else None,
            ),
        )

        # Enregistrer dans les logs
        crud.add_ticket_log(
            self.db,
            ticket_id=current_ticket_id,
            auteur="USER",
            message=message,
        )
        crud.add_ticket_log(
            self.db,
            ticket_id=current_ticket_id,
            auteur="AGENT",
            message=agent_output.get("reponse_client", ""),
            outils_appeles=agent_output.get("execution", {}).get("outils_appeles", []),
            sources_citees=agent_output.get("execution", {}).get("sources_consultees", []),
            latence_ms=latence_ms,
        )

        return agent_output

    def _build_fallback_response(self, ticket_id: str, raw_content: str) -> dict:
        """Réponse de secours si le LLM ne produit pas de JSON valide."""
        return {
            "meta": {"ticket_id": ticket_id, "est_reprise": False, "timestamp": "", "latence_ms": 0},
            "classification": {
                "categorie": "autre_indetermine",
                "priority_matrix": {
                    "touch_multiple_users": False,
                    "critical_process_blocked": False,
                    "no_workaround": False,
                    "security_threat": False
                },
                "priorite": "P3_moyenne",
                "equipe_affectee": "support_n1",
                "confiance": 0.5
            },
            "diagnostic": {
                "complet": False,
                "symptome": raw_content[:200],
                "titre": raw_content[:50] or "Incident non classifié",
                "informations_manquantes": ["Analyse incomplète"]
            },
            "decision": {"action": "demande_information", "validation_humaine_requise": False, "statut_ticket": "EN_COURS"},
            "execution": {"sources_consultees": [], "outils_appeles": []},
            "reponse_client": "J'ai bien reçu votre demande. Pourriez-vous me donner plus de détails sur le problème rencontré ?",
        }
