"""
Outil : escalader_vers_technicien — Redirection vers le bon niveau de support.
"""
from langchain.tools import tool

EQUIPES = {
    "support_n1": {"nom": "Support Niveau 1 (Helpdesk)", "email": "support@ispm.fr", "tel": "+212-XXX-001"},
    "support_n2": {"nom": "Support Niveau 2 (Technique)", "email": "support-n2@ispm.fr", "tel": "+212-XXX-002"},
    "infrastructure_reseau": {"nom": "Équipe Infrastructure Réseau", "email": "infra@ispm.fr", "tel": "+212-XXX-003"},
    "securite_informatique": {"nom": "Équipe Sécurité Informatique", "email": "ssi@ispm.fr", "tel": "+212-XXX-004"},
    "dsi": {"nom": "Direction des Systèmes d'Information", "email": "dsi@ispm.fr", "tel": "+212-XXX-000"},
}


@tool
def escalader_vers_technicien(equipe: str, priorite: str, ticket_id: str, description: str) -> str:
    """
    Escalade un ticket vers l'équipe technique appropriée.
    Utilisé quand l'agent ne peut pas résoudre le problème automatiquement.

    Args:
        equipe: Code de l'équipe (support_n1, support_n2, infrastructure_reseau, securite_informatique, dsi)
        priorite: Niveau de priorité de l'escalade (P1_critique, P2_haute, P3_moyenne, P4_basse)
        ticket_id: ID du ticket à escalader
        description: Résumé du problème pour l'équipe technique
    """
    equipe_info = EQUIPES.get(equipe, {"nom": equipe, "email": "support@ispm.fr", "tel": "N/A"})

    urgence = {
        "P1_critique": "🔴 CRITIQUE — Intervention immédiate requise",
        "P2_haute": "🟠 HAUTE — Intervention dans les 2h",
        "P3_moyenne": "🟡 MOYENNE — Intervention dans les 4h",
        "P4_basse": "🟢 BASSE — Intervention dans les 24h",
    }.get(priorite, priorite)

    return (
        f"Escalade envoyée vers {equipe_info['nom']} | "
        f"Contact: {equipe_info['email']} | "
        f"Urgence: {urgence} | "
        f"Ticket: {ticket_id} | "
        f"Résumé: {description[:100]}"
    )
