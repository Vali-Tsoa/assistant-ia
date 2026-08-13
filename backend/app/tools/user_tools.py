"""
Outil : rechercher_utilisateur — Vérifie droits et poste d'un utilisateur.
"""
from langchain.tools import tool


# Données mock (en production → requête DB)
MOCK_USERS = {
    "USR-001": {"nom": "Marie Dupont", "departement": "Comptabilité", "role": "user", "actif": True},
    "USR-002": {"nom": "Jean Martin", "departement": "Informatique", "role": "technicien", "actif": True},
    "USR-003": {"nom": "Sophie Bernard", "departement": "Ressources Humaines", "role": "user", "actif": True},
}


@tool
def rechercher_utilisateur(user_id: str) -> str:
    """
    Recherche les informations d'un utilisateur par son ID.
    Retourne son nom, département, rôle et statut (actif/inactif).
    Utilise cet outil pour vérifier les droits avant d'effectuer une action sensible.

    Args:
        user_id: L'identifiant de l'utilisateur (ex: USR-001)
    """
    user = MOCK_USERS.get(user_id)
    if not user:
        return f"Utilisateur {user_id} introuvable dans le système."
    status = "actif" if user["actif"] else "inactif (compte désactivé)"
    return (
        f"Utilisateur {user_id}: {user['nom']} | "
        f"Département: {user['departement']} | "
        f"Rôle: {user['role']} | "
        f"Statut: {status}"
    )
