"""
Détection déterministe de la priorité des tickets basée sur des critères objectifs.
"""
from typing import Dict

# Les questions de qualification de la priorité
QUESTIONS = {
    "touch_multiple_users": "Est-ce que le problème impacte plusieurs utilisateurs ou tout un service ?",
    "critical_process_blocked": "Est-ce qu'un service critique, serveur de production ou outil métier essentiel est totalement bloqué ?",
    "no_workaround": "Est-ce qu'il n'existe aucune solution de contournement temporaire disponible pour l'utilisateur ?",
    "security_threat": "Est-ce qu'il s'agit d'une menace de sécurité active ou d'un incident de cybersécurité (phishing, ransomware, virus) ?"
}

def calculate_priority(matrix: Dict[str, bool]) -> str:
    """
    Calcule la priorité (P1_critique, P2_haute, P3_moyenne, P4_basse)
    en fonction d'une matrice de réponses booléennes (Oui/Non).
    """
    touch_multiple = matrix.get("touch_multiple_users", False)
    critical_blocked = matrix.get("critical_process_blocked", False)
    no_workaround = matrix.get("no_workaround", False)
    security_threat = matrix.get("security_threat", False)

    # 1. P1 Critique : Blocage critique à grande échelle sans solution de contournement, ou cyberattaque sur plusieurs postes.
    if (touch_multiple and critical_blocked and no_workaround) or (security_threat and touch_multiple):
        return "P1_critique"
    
    # 2. P2 Haute : Blocage critique individuel sans contournement, ou blocage généralisé avec contournement difficile.
    elif (critical_blocked and no_workaround) or (touch_multiple and no_workaround) or security_threat:
        return "P2_haute"
    
    # 3. P3 Moyenne : Incident impactant mais pas totalement bloquant, ou avec contournement temporaire simple.
    elif critical_blocked or touch_multiple or no_workaround:
        return "P3_moyenne"
    
    # 4. P4 Basse : Demande d'information, question ou problème mineur avec contournement évident.
    else:
        return "P4_basse"
