"""
Gestionnaire de contexte — Gère la continuité ticket/conversation.
Détermine si un message est une reprise ou un nouveau ticket.
"""
from sqlalchemy.orm import Session
from app.db import crud, models


class ContextManager:
    """
    Charge ou initialise le contexte d'un ticket.
    Construit l'historique de conversation pour l'agent.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_or_create_context(
        self,
        user_id: str,
        message: str,
        ticket_id: str | None = None,
    ) -> dict:
        """
        Si ticket_id fourni et existe → reprise ticket existant.
        Sinon → création d'un nouveau contexte.
        """
        utilisateur = crud.get_utilisateur(self.db, user_id)
        if not utilisateur:
            raise ValueError(f"Utilisateur {user_id} introuvable")

        if ticket_id:
            ticket = crud.get_ticket(self.db, ticket_id)
            if ticket and ticket.utilisateur_id == user_id:
                return self._load_existing_context(ticket, utilisateur, message)

        # Nouveau ticket
        return self._new_context(utilisateur, message)

    def _load_existing_context(
        self,
        ticket: models.Ticket,
        utilisateur: models.Utilisateur,
        message: str,
    ) -> dict:
        """Charge l'historique d'un ticket existant."""
        logs = crud.get_ticket_history(self.db, ticket.id)
        history = [
            {"role": "user" if log.auteur == "USER" else "assistant", "content": log.message}
            for log in logs
        ]
        return {
            "est_reprise": True,
            "ticket_id": ticket.id,
            "ticket_statut": ticket.statut,
            "ticket_categorie": ticket.categorie,
            "utilisateur": {
                "id": utilisateur.id,
                "nom": utilisateur.nom,
                "departement": utilisateur.departement,
                "role": utilisateur.role,
            },
            "historique_conversation": history,
            "nouveau_message": message,
        }

    def _new_context(self, utilisateur: models.Utilisateur, message: str) -> dict:
        """Initialise un nouveau contexte pour un ticket vierge."""
        return {
            "est_reprise": False,
            "ticket_id": None,
            "ticket_statut": None,
            "ticket_categorie": None,
            "utilisateur": {
                "id": utilisateur.id,
                "nom": utilisateur.nom,
                "departement": utilisateur.departement,
                "role": utilisateur.role,
            },
            "historique_conversation": [],
            "nouveau_message": message,
        }
