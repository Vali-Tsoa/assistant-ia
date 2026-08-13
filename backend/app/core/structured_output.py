"""
Schemas Pydantic pour les sorties structurées de l'Agent AI.
Garantit que l'agent renvoie toujours un JSON valide et complet.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field


class MetaOutput(BaseModel):
    ticket_id: str
    est_reprise: bool
    timestamp: str
    latence_ms: int


class ClassificationOutput(BaseModel):
    categorie: str = Field(
        description="Catégorie du problème",
        examples=["reseau_et_connectivite", "materiel", "compte_et_acces", "logiciel", "autre"]
    )
    priorite: str = Field(
        description="Niveau de priorité",
        examples=["P1_critique", "P2_haute", "P3_moyenne", "P4_basse"]
    )
    equipe_affectee: str = Field(
        description="Équipe responsable du traitement"
    )
    confiance: float = Field(ge=0.0, le=1.0, description="Score de confiance 0-1")


class DiagnosticOutput(BaseModel):
    complet: bool
    symptome: str
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
STRUCTURED_OUTPUT_INSTRUCTIONS = """
Tu dois TOUJOURS répondre avec un objet JSON valide respectant exactement ce schéma :
{
  "meta": { "ticket_id": "...", "est_reprise": false, "timestamp": "...", "latence_ms": 0 },
  "classification": {
    "categorie": "reseau_et_connectivite|materiel|compte_et_acces|logiciel|autre",
    "priorite": "P1_critique|P2_haute|P3_moyenne|P4_basse",
    "equipe_affectee": "...",
    "confiance": 0.0-1.0
  },
  "diagnostic": { "complet": true|false, "symptome": "...", "informations_manquantes": [] },
  "decision": {
    "action": "resolution_automatique|demande_information|escalade_technicien|refus_securite",
    "validation_humaine_requise": false,
    "statut_ticket": "EN_COURS|EN_ATTENTE_UTILISATEUR|RESOLU|ESCALADE"
  },
  "execution": { "sources_consultees": [], "outils_appeles": [] },
  "reponse_client": "Message clair et professionnel pour l'utilisateur"
}
"""
