"""
Outils disponibles pour l'agent — catalogue de tools Python.
"""
from sqlalchemy.orm import Session

from app.tools.user_tools import rechercher_utilisateur
from app.tools.equipment_tools import consulter_equipement
from app.tools.service_tools import verifier_etat_service
from app.tools.ticket_tools import creer_ticket_tool, mettre_a_jour_ticket
from app.tools.escalation_tools import escalader_vers_technicien


def get_all_tools(db: Session) -> list:
    """Retourne la liste de tous les outils avec leur contexte DB."""
    return [
        rechercher_utilisateur,
        consulter_equipement,
        verifier_etat_service,
        creer_ticket_tool,
        mettre_a_jour_ticket,
        escalader_vers_technicien,
    ]
