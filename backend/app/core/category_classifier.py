"""
Centralisation et configuration des catégories de tickets pour l'assistant IA.
"""
from typing import Dict, List

CATEGORIES: Dict[str, str] = {
    "comptes_et_authentification": "Mots de passe oubliés, comptes verrouillés, MFA.",
    "reseau_et_connectivite": "Perte de connexion, lenteurs réseau, Wi-Fi, VPN.",
    "materiel_informatique": "Le poste ne démarre pas, panne de composants (disque, RAM), écran noir.",
    "logiciels_et_applications": "Crash d'application, bugs, erreurs de licence, installations logicielles.",
    "imprimantes_et_peripheriques": "Impression impossible, scanner déconnecté, problèmes de câblage/périphériques.",
    "droits_d_acces": "Demandes d'accès aux répertoires partagés, rôles applicatifs, habilitations.",
    "cybersecurite": "E-mails suspects, hameçonnage (phishing), ransomware, virus, comportement anormal de l'appareil.",
    "incertain_non_compris": "Le message de l'utilisateur n'est pas compris ou manque totalement de clarté. L'assistant doit demander explicitement des précisions.",
    "autre_indetermine": "Demandes floues, hors scope ou impossibles à classer dans les catégories ci-dessus."
}

def get_categories_list() -> List[str]:
    """Retourne la liste brute des identifiants de catégories."""
    return list(CATEGORIES.keys())

def get_categories_prompt_text() -> str:
    """Génère le texte de description des catégories pour le System Prompt."""
    lines = []
    for cat, desc in CATEGORIES.items():
        lines.append(f"- `{cat}` : {desc}")
    return "\n".join(lines)
