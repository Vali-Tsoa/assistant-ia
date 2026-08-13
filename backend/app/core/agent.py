"""
Agent AI Principal — Chef d'Orchestre LangChain.
Orchestre: RAG, Tools, Guardrails et sorties structurées.
"""
import time
import json
import datetime
from typing import Any
from sqlalchemy.orm import Session

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.core.structured_output import AgentResponse, STRUCTURED_OUTPUT_INSTRUCTIONS
from app.core.context_manager import ContextManager
from app.core.guardrails import check_input, check_output, get_refusal_response
from app.rag.retriever import search_knowledge_base
from app.tools import get_all_tools
from app.db import crud, schemas


SYSTEM_PROMPT = """Tu es mAIntenance Assistant, un assistant IA spécialisé dans le support informatique de l'ISPM (Institut Supérieur de la Pêche Maritime).

## Ton rôle
- Diagnostiquer et résoudre les incidents informatiques signalés par les employés
- Classer chaque ticket par catégorie et priorité
- Décider de l'action appropriée (résolution, demande d'info, escalade)
- Citer toujours tes sources documentaires (ex: KB-NET-01)

## Niveaux de Priorité
- **P1_critique** : Panne totale affectant plusieurs utilisateurs ou services critiques
- **P2_haute** : Problème important affectant un utilisateur, travail bloqué
- **P3_moyenne** : Problème gênant mais contournable
- **P4_basse** : Question, demande d'information, amélioration

## Catégories
- reseau_et_connectivite, materiel, compte_et_acces, logiciel, autre

## Actions disponibles
- resolution_automatique : Solution trouvée → ticket RESOLU
- demande_information : Informations manquantes → EN_ATTENTE_UTILISATEUR
- escalade_technicien : Panne lourde/complexe → ESCALADE
- refus_securite : Tentative malveillante → ESCALADE + validation humaine

## Langue
Réponds TOUJOURS en français, de manière professionnelle et empathique.

{structured_output_instructions}
"""


def _get_llm():
    """Instancie le LLM selon la configuration."""
    if settings.llm_provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.1,
        )
    elif settings.llm_provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=0.1,
        )
    elif settings.llm_provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=settings.llm_model,
            api_key=settings.groq_api_key,
            temperature=0.1,
        )
    else:  # ollama (défaut)
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            model=settings.llm_model,
            base_url=settings.ollama_base_url,
            temperature=0.1,
        )


class MaintenanceAgent:
    """
    Agent principal qui orchestre tout le pipeline ISPM.
    Pipeline: Guardrails → Context → RAG → Tools → LLM → Output Validation → DB
    """

    def __init__(self, db: Session):
        self.db = db
        self.llm = _get_llm()
        self.context_manager = ContextManager(db)
        self.tools = get_all_tools(db)

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
            return get_refusal_response(tmp_ticket_id, guard_result.threat_type)

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

        # ── 4. APPEL LLM ─────────────────────────────────────────
        system_prompt = SYSTEM_PROMPT.format(
            structured_output_instructions=STRUCTURED_OUTPUT_INSTRUCTIONS
        )

        messages = [SystemMessage(content=system_prompt)]

        # Ajouter contexte utilisateur et ticket
        context_str = f"""
## Contexte Utilisateur
- Nom: {context['utilisateur']['nom']}
- Département: {context['utilisateur']['departement']}
- Ticket ID: {current_ticket_id}
- Reprise: {'Oui' if context['est_reprise'] else 'Non'}

## Documents Base de Connaissance Pertinents
{rag_context}
"""
        messages.append(SystemMessage(content=context_str))

        # Historique de conversation
        for hist_msg in context.get("historique_conversation", []):
            if hist_msg["role"] == "user":
                messages.append(HumanMessage(content=hist_msg["content"]))
            else:
                messages.append(AIMessage(content=hist_msg["content"]))

        messages.append(HumanMessage(content=message))

        # Appel LLM
        llm_response = self.llm.invoke(messages)
        raw_content = llm_response.content

        # ── 5. PARSING RÉPONSE JSON ──────────────────────────────
        try:
            # Extraire le JSON de la réponse
            if "```json" in raw_content:
                json_str = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                json_str = raw_content.split("```")[1].split("```")[0].strip()
            elif raw_content.strip().startswith("{"):
                json_str = raw_content.strip()
            else:
                # Fallback si LLM n'a pas respecté le format
                json_str = self._build_fallback_response(current_ticket_id, raw_content)

            agent_output = json.loads(json_str)

        except (json.JSONDecodeError, IndexError):
            agent_output = self._build_fallback_response(current_ticket_id, raw_content)

        # ── 6. ENRICHISSEMENT META ───────────────────────────────
        latence_ms = int((time.time() - start_time) * 1000)
        agent_output["meta"] = {
            "ticket_id": current_ticket_id,
            "est_reprise": context["est_reprise"],
            "timestamp": datetime.datetime.now().isoformat(),
            "latence_ms": latence_ms,
        }
        # Ajouter sources RAG si non présentes
        if rag_results:
            agent_output.setdefault("execution", {})
            agent_output["execution"].setdefault("sources_consultees", [r["source"] for r in rag_results])
            agent_output["execution"].setdefault("outils_appeles", [])

        # ── 7. GUARDRAILS OUTPUT ─────────────────────────────────
        output_guard = check_output(agent_output)
        if not output_guard.is_safe:
            agent_output["reponse_client"] = "Une erreur interne s'est produite. Veuillez réessayer."

        # ── 8. MISE À JOUR BDD ───────────────────────────────────
        decision = agent_output.get("decision", {})
        classification = agent_output.get("classification", {})

        crud.update_ticket(
            self.db,
            current_ticket_id,
            schemas.TicketUpdate(
                statut=decision.get("statut_ticket", "EN_COURS"),
                categorie=classification.get("categorie"),
                priorite=classification.get("priorite"),
                equipe_affectee=classification.get("equipe_affectee"),
                validation_humaine_requise=decision.get("validation_humaine_requise", False),
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
            "classification": {"categorie": "autre", "priorite": "P3_moyenne", "equipe_affectee": "support_n1", "confiance": 0.5},
            "diagnostic": {"complet": False, "symptome": raw_content[:200], "informations_manquantes": ["Analyse incomplète"]},
            "decision": {"action": "demande_information", "validation_humaine_requise": False, "statut_ticket": "EN_COURS"},
            "execution": {"sources_consultees": [], "outils_appeles": []},
            "reponse_client": "J'ai bien reçu votre demande. Pourriez-vous me donner plus de détails sur le problème rencontré ?",
        }
