"""
Schemas Pydantic pour les sorties structurées de l'Agent AI.
Garantit que l'agent renvoie toujours un JSON valide et complet.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field
from app.core.category_classifier import get_categories_list


class MetaOutput(BaseModel):
    ticket_id: str
    est_reprise: bool
    timestamp: str
    latence_ms: int


class PriorityMatrix(BaseModel):
    touch_multiple_users: bool = Field(
        description="Est-ce que le problème impacte plusieurs utilisateurs ou tout un service ?"
    )
    critical_process_blocked: bool = Field(
        description="Est-ce qu'un service critique, serveur de production ou outil métier essentiel est totalement bloqué ?"
    )
    no_workaround: bool = Field(
        description="Est-ce qu'il n'existe aucune solution de contournement temporaire disponible ?"
    )
    security_threat: bool = Field(
        description="Est-ce qu'il s'agit d'une menace de sécurité active ?"
    )


class ClassificationOutput(BaseModel):
    categorie: str = Field(
        description="Catégorie du problème",
        examples=get_categories_list()
    )
    priority_matrix: PriorityMatrix
    priorite: Optional[str] = Field(
        default=None,
        description="Niveau de priorité (calculé par le backend)",
        examples=["P1_critique", "P2_haute", "P3_moyenne", "P4_basse"]
    )
    equipe_affectee: str = Field(
        description="Équipe responsable du traitement"
    )
    confiance: float = Field(ge=0.0, le=1.0, description="Score de confiance 0-1")


class DiagnosticOutput(BaseModel):
    complet: bool
    symptome: str
    titre: str = Field(
        description="Titre très court, explicite et abrégé de l'incident (max 50 caractères, ex: 'VPN déconnecté', 'MFA bloqué', 'Poste ne démarre pas')"
    )
    informations_manquantes: list[str]


class DecisionOutput(BaseModel):
    action: str = Field(
        description="Action décidée par l'agent",
        examples=["resolution_automatique", "demande_information", "escalade_technicien", "refus_securite"]
    )
    validation_humaine_requise: bool
    statut_ticket: str = Field(
        examples=["EN_COURS", "EN_ATTENTE_UTILISATEUR", "RESOLU", "ESCALADE"]
    )


class OutilAppele(BaseModel):
    outil: str
    parametres: dict[str, Any]
    resultat: str


class ExecutionOutput(BaseModel):
    sources_consultees: list[str]
    outils_appeles: list[OutilAppele]


class AgentResponse(BaseModel):
    """Réponse complète et structurée de l'agent — envoyée au frontend."""
    meta: MetaOutput
    classification: ClassificationOutput
    diagnostic: DiagnosticOutput
    decision: DecisionOutput
    execution: ExecutionOutput
    reponse_client: str = Field(description="Message à afficher à l'utilisateur")


# Prompt instruction pour forcer la sortie structurée
categories_str = "|".join(get_categories_list())
STRUCTURED_OUTPUT_INSTRUCTIONS = f"""
Tu dois TOUJOURS répondre avec un objet JSON valide respectant exactement ce schéma :
{{
  "meta": {{ "ticket_id": "...", "est_reprise": false, "timestamp": "...", "latence_ms": 0 }},
  "classification": {{
    "categorie": "{categories_str}",
    "priority_matrix": {{
      "touch_multiple_users": true|false,
      "critical_process_blocked": true|false,
      "no_workaround": true|false,
      "security_threat": true|false
    }},
    "priorite": null,
    "equipe_affectee": "...",
    "confiance": 0.0-1.0
  }},
  "diagnostic": {{ "complet": true|false, "symptome": "...", "titre": "Titre explicite et abrégé de l'incident (ex: MFA bloqué)", "informations_manquantes": [] }},
  "decision": {{
    "action": "resolution_automatique|demande_information|escalade_technicien|refus_securite",
    "validation_humaine_requise": false,
    "statut_ticket": "EN_COURS|EN_ATTENTE_UTILISATEUR|RESOLU|ESCALADE"
  }},
  "execution": {{ "sources_consultees": [], "outils_appeles": [] }},
  "reponse_client": "Message clair et professionnel pour l'utilisateur"
}}
"""
