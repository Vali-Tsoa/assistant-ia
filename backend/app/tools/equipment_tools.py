"""
Outil : consulter_equipement — Vérifie l'état du matériel informatique.
"""
from langchain.tools import tool

MOCK_EQUIPMENT = {
    "PC-001": {"type": "Ordinateur portable", "modele": "Dell Latitude 5540", "utilisateur": "USR-001", "garantie": "2027-06", "etat": "operationnel"},
    "PC-002": {"type": "Ordinateur de bureau", "modele": "HP EliteDesk 800", "utilisateur": "USR-003", "garantie": "2025-12", "etat": "defectueux", "note": "Disque dur défaillant signalé"},
    "SW-ETG3": {"type": "Switch réseau", "modele": "Cisco Catalyst 2960", "zone": "Étage 3", "garantie": "2026-10", "etat": "hors_service", "note": "Port 12 défaillant"},
    "ROUTER-MAIN": {"type": "Routeur principal", "modele": "Cisco ISR 4321", "zone": "Salle serveurs", "garantie": "2028-01", "etat": "operationnel"},
}


@tool
def consulter_equipement(equipement_id: str) -> str:
    """
    Consulte l'état d'un équipement informatique (PC, switch, imprimante, etc.).
    Vérifie s'il est en garantie, en panne signalée ou opérationnel.

    Args:
        equipement_id: L'identifiant de l'équipement (ex: PC-001, SW-ETG3)
    """
    equip = MOCK_EQUIPMENT.get(equipement_id.upper())
    if not equip:
        return f"Équipement {equipement_id} non trouvé dans l'inventaire."

    garantie_info = f"Sous garantie jusqu'au {equip['garantie']}" if equip.get("garantie") else "Hors garantie"
    note = f" | Note: {equip['note']}" if equip.get("note") else ""
    zone_ou_user = f"Zone: {equip.get('zone', 'N/A')}" if "zone" in equip else f"Utilisateur: {equip.get('utilisateur', 'N/A')}"

    return (
        f"Équipement {equipement_id}: {equip['type']} {equip['modele']} | "
        f"{zone_ou_user} | "
        f"État: {equip['etat'].upper()} | "
        f"{garantie_info}{note}"
    )
