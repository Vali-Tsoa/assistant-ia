"""
Outil : verifier_etat_service — Vérifie si un service/réseau est en panne globale.
"""
from langchain.tools import tool
from datetime import datetime

# États des services simulés (en production → monitoring Prometheus/Nagios)
MOCK_SERVICES = {
    "vpn": {"nom": "Serveur VPN", "statut": "operational", "derniere_verif": "2026-08-13T10:00:00"},
    "email": {"nom": "Serveur Email (Exchange)", "statut": "operational", "derniere_verif": "2026-08-13T10:00:00"},
    "ad": {"nom": "Active Directory", "statut": "operational", "derniere_verif": "2026-08-13T10:00:00"},
    "internet": {"nom": "Accès Internet", "statut": "operational", "derniere_verif": "2026-08-13T10:00:00"},
    "reseau_etage_3": {"nom": "Réseau Étage 3", "statut": "down", "derniere_verif": "2026-08-13T09:45:00", "incident": "Switch_E3_Down"},
    "reseau_etage_1": {"nom": "Réseau Étage 1", "statut": "operational", "derniere_verif": "2026-08-13T10:00:00"},
    "partage_fichiers": {"nom": "Serveur de fichiers partagés", "statut": "degraded", "derniere_verif": "2026-08-13T09:50:00", "incident": "Latence élevée"},
}


@tool
def verifier_etat_service(service_name: str) -> str:
    """
    Vérifie l'état actuel d'un service ou d'une infrastructure réseau.
    Permet de détecter si une panne est globale avant de diagnostiquer l'utilisateur.

    Args:
        service_name: Nom du service à vérifier (ex: vpn, email, reseau_etage_3, internet, ad)
    """
    service_key = service_name.lower().replace(" ", "_").replace("-", "_")
    service = MOCK_SERVICES.get(service_key)

    if not service:
        return f"Service '{service_name}' non trouvé dans le monitoring. Services disponibles: {', '.join(MOCK_SERVICES.keys())}"

    statut_emoji = {"operational": "✅", "down": "🔴", "degraded": "⚠️"}.get(service["statut"], "❓")
    incident_info = f" | Incident: {service['incident']}" if service.get("incident") else ""

    return (
        f"{statut_emoji} {service['nom']}: {service['statut'].upper()} | "
        f"Dernière vérification: {service['derniere_verif']}{incident_info}"
    )
