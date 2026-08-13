"""
Guardrails de sécurité — Filtrage des entrées et sorties.
Détecte: Prompt Injection, données sensibles, actions à haut risque.
"""
import re
import json
from dataclasses import dataclass


# Patterns de prompt injection connus
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"oublie\s+(toutes?\s+)?tes\s+(instructions?|consignes?)",
    r"act\s+as\s+if\s+you",
    r"DAN\s+mode",
    r"jailbreak",
    r"system\s*:\s*you\s+are\s+now",
    r"<\s*system\s*>",
    r"\[INST\].*ignore",
    r"pretend\s+you\s+are",
    r"fais\s+semblant\s+d.être",
    r"tu\s+es\s+maintenant\s+un",
    r"donne[\-\s]moi\s+(l.accès|les?\s+mot\s+de\s+passe|les?\s+credentials?)",
    r"accès\s+admin",
    r"bypass\s+(security|sécurité|auth)",
]

# Patterns de données sensibles à ne pas exfiltrer
SENSITIVE_PATTERNS = [
    r"\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b",  # Cartes bancaires
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",  # Emails multiples
    r"password\s*[:=]\s*\S+",                        # Mots de passe en clair
    r"mot\s+de\s+passe\s*[:=]\s*\S+",
]

# Actions nécessitant validation humaine
HIGH_RISK_ACTIONS = [
    "réinitialisation de mot de passe admin",
    "modification droits administrateur",
    "suppression compte utilisateur",
    "accès données sensibles",
    "modification configuration réseau critique",
]


@dataclass
class GuardrailResult:
    is_safe: bool
    threat_type: str | None = None
    threat_detail: str | None = None
    requires_human_validation: bool = False


def check_input(user_message: str) -> GuardrailResult:
    """
    Analyse le message utilisateur avant traitement par l'agent.
    Retourne un GuardrailResult indiquant si le message est sûr.
    """
    message_lower = user_message.lower()

    # 1. Détection prompt injection
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, message_lower, re.IGNORECASE):
            return GuardrailResult(
                is_safe=False,
                threat_type="prompt_injection",
                threat_detail=f"Pattern détecté: {pattern}",
            )

    # 2. Détection exfiltration données sensibles
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, user_message, re.IGNORECASE):
            return GuardrailResult(
                is_safe=False,
                threat_type="sensitive_data_exposure",
                threat_detail="Données sensibles détectées dans le message",
            )

    # 3. Actions à haut risque → validation humaine requise
    for action in HIGH_RISK_ACTIONS:
        if action.lower() in message_lower:
            return GuardrailResult(
                is_safe=True,
                requires_human_validation=True,
                threat_type="high_risk_action",
                threat_detail=f"Action sensible détectée: {action}",
            )

    return GuardrailResult(is_safe=True)


def check_output(agent_response: dict) -> GuardrailResult:
    """
    Valide la sortie JSON de l'agent avant envoi au frontend.
    """
    # Vérifier les champs obligatoires
    required_fields = ["meta", "classification", "diagnostic", "decision", "execution", "reponse_client"]
    for field in required_fields:
        if field not in agent_response:
            return GuardrailResult(
                is_safe=False,
                threat_type="malformed_output",
                threat_detail=f"Champ manquant: {field}",
            )

    # Vérifier que la réponse client ne contient pas d'informations sensibles
    reponse = agent_response.get("reponse_client", "")
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, reponse, re.IGNORECASE):
            return GuardrailResult(
                is_safe=False,
                threat_type="sensitive_data_in_output",
                threat_detail="Données sensibles détectées dans la réponse agent",
            )

    return GuardrailResult(is_safe=True)


def get_refusal_response(ticket_id: str, threat_type: str) -> dict:
    """Génère la réponse standard pour un message refusé."""
    import datetime
    return {
        "meta": {
            "ticket_id": ticket_id,
            "est_reprise": False,
            "timestamp": datetime.datetime.now().isoformat(),
            "latence_ms": 0,
        },
        "classification": {
            "categorie": "securite",
            "priorite": "P1_critique",
            "equipe_affectee": "securite_informatique",
            "confiance": 1.0,
        },
        "diagnostic": {
            "complet": True,
            "symptome": f"Tentative détectée: {threat_type}",
            "informations_manquantes": [],
        },
        "decision": {
            "action": "refus_securite",
            "validation_humaine_requise": True,
            "statut_ticket": "ESCALADE",
        },
        "execution": {"sources_consultees": [], "outils_appeles": []},
        "reponse_client": (
            "⚠️ Votre message a été signalé par nos systèmes de sécurité et ne peut pas être traité. "
            "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter directement votre technicien support."
        ),
    }
