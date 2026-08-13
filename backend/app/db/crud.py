"""
Opérations CRUD pour tous les modèles.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import models, schemas
import uuid


# ===== UTILISATEURS =====

def get_utilisateur(db: Session, user_id: str) -> models.Utilisateur | None:
    return db.query(models.Utilisateur).filter(models.Utilisateur.id == user_id).first()


def get_utilisateur_by_email(db: Session, email: str) -> models.Utilisateur | None:
    return db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()


def list_utilisateurs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Utilisateur).offset(skip).limit(limit).all()


def create_utilisateur(db: Session, user: schemas.UtilisateurCreate) -> models.Utilisateur:
    db_user = models.Utilisateur(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ===== TICKETS =====

def get_ticket(db: Session, ticket_id: str) -> models.Ticket | None:
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()


def get_tickets_by_user(db: Session, user_id: str) -> list[models.Ticket]:
    return db.query(models.Ticket).filter(models.Ticket.utilisateur_id == user_id).all()


def list_tickets(db: Session, statut: str | None = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Ticket)
    if statut:
        query = query.filter(models.Ticket.statut == statut)
    return query.order_by(models.Ticket.date_creation.desc()).offset(skip).limit(limit).all()


def create_ticket(db: Session, ticket: schemas.TicketCreate) -> models.Ticket:
    ticket_id = f"TCK-{datetime.now().year}-{str(uuid.uuid4())[:6].upper()}"
    db_ticket = models.Ticket(id=ticket_id, **ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: str, update: schemas.TicketUpdate) -> models.Ticket | None:
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        return None
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    ticket.date_mise_a_jour = datetime.now()
    db.commit()
    db.refresh(ticket)
    return ticket


# ===== TICKET LOGS =====

def add_ticket_log(
    db: Session,
    ticket_id: str,
    auteur: str,
    message: str,
    outils_appeles: list = None,
    sources_citees: list = None,
    latence_ms: int = 0,
    tokens_utilises: int = 0,
) -> models.TicketLog:
    log = models.TicketLog(
        ticket_id=ticket_id,
        auteur=auteur,
        message=message,
        outils_appeles=outils_appeles or [],
        sources_citees=sources_citees or [],
        latence_ms=latence_ms,
        tokens_utilises=tokens_utilises,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_ticket_history(db: Session, ticket_id: str) -> list[models.TicketLog]:
    return (
        db.query(models.TicketLog)
        .filter(models.TicketLog.ticket_id == ticket_id)
        .order_by(models.TicketLog.horodatage.asc())
        .all()
    )
