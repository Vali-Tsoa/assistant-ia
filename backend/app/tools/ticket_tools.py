"""
Outils : creer_ticket et mettre_a_jour_ticket — Interaction avec la BDD SQL.
"""
from langchain.tools import tool


@tool
def creer_ticket_tool(utilisateur_id: str, titre: str, description: str) -> str:
    """
    Crée un nouveau ticket d'incident dans le système.
    Utilise cet outil quand un utilisateur signale un nouveau problème.

    Args:
        utilisateur_id: ID de l'utilisateur qui signale le problème (ex: USR-001)
        titre: Titre court du problème (max 100 caractères)
        description: Description complète du problème
    """
    # En production → appel crud.create_ticket(db, ...)
    import uuid
    from datetime import datetime
    ticket_id = f"TCK-{datetime.now().year}-{str(uuid.uuid4())[:6].upper()}"
    return f"Ticket créé avec succès: {ticket_id} | Titre: {titre[:50]} | Utilisateur: {utilisateur_id}"


@tool
def mettre_a_jour_ticket(
    ticket_id: str,
    statut: str = None,
    priorite: str = None,
    categorie: str = None,
    equipe_affectee: str = None,
) -> str:
    """
    Met à jour les informations d'un ticket existant.
    Utilisé pour changer le statut, la priorité ou l'équipe assignée.

    Args:
        ticket_id: ID du ticket à mettre à jour (ex: TCK-2026-ABC123)
        statut: Nouveau statut (EN_COURS, EN_ATTENTE_UTILISATEUR, RESOLU, ESCALADE)
        priorite: Priorité (P1_critique, P2_haute, P3_moyenne, P4_basse)
        categorie: Catégorie du problème
        equipe_affectee: Équipe qui prend en charge le ticket
    """
    updates = []
    if statut:
        updates.append(f"statut={statut}")
    if priorite:
        updates.append(f"priorité={priorite}")
    if categorie:
        updates.append(f"catégorie={categorie}")
    if equipe_affectee:
        updates.append(f"équipe={equipe_affectee}")

    if not updates:
        return f"Aucune mise à jour spécifiée pour le ticket {ticket_id}."

    return f"Ticket {ticket_id} mis à jour: {', '.join(updates)}"
