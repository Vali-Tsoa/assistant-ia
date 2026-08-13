"""
Schemas Pydantic pour la validation des données API.
Séparation Input (Create/Update) / Output (Read).
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr


# ===== UTILISATEUR =====

class UtilisateurBase(BaseModel):
    nom: str
    email: str
    departement: Optional[str] = None
    role: str = "user"


class UtilisateurCreate(UtilisateurBase):
    id: str


class UtilisateurRead(UtilisateurBase):
    id: str

    class Config:
        from_attributes = True


# ===== TICKET =====

class TicketBase(BaseModel):
    titre: str
    description_originale: Optional[str] = None


class TicketCreate(TicketBase):
    utilisateur_id: str


class TicketUpdate(BaseModel):
    titre: Optional[str] = None
    statut: Optional[str] = None
    categorie: Optional[str] = None
    priorite: Optional[str] = None
    equipe_affectee: Optional[str] = None
    validation_humaine_requise: Optional[bool] = None
    diagnostic: Optional[str] = None
    raison_urgence: Optional[str] = None
    raison_escalade: Optional[str] = None


class TicketRead(TicketBase):
    id: str
    utilisateur_id: str
    categorie: Optional[str]
    priorite: Optional[str]
    equipe_affectee: Optional[str]
    statut: str
    confiance_score: float
    validation_humaine_requise: bool
    diagnostic: Optional[str]
    raison_urgence: Optional[str]
    raison_escalade: Optional[str]
    date_creation: datetime
    date_mise_a_jour: datetime

    class Config:
        from_attributes = True


# ===== TICKET LOG =====

class TicketLogRead(BaseModel):
    id: int
    ticket_id: str
    auteur: str
    message: str
    outils_appeles: list[dict[str, Any]]
    sources_citees: list[str]
    latence_ms: int
    tokens_utilises: int
    horodatage: datetime

    class Config:
        from_attributes = True


# ===== CHAT =====

class ChatRequest(BaseModel):
    message: str
    user_id: str
    ticket_id: Optional[str] = None  # None = nouveau ticket


class ChatResponse(BaseModel):
    """Réponse structurée complète renvoyée par l'agent."""
    meta: dict[str, Any]
    classification: dict[str, Any]
    diagnostic: dict[str, Any]
    decision: dict[str, Any]
    execution: dict[str, Any]
    reponse_client: str
