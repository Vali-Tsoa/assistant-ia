"""
Router API — Tickets CRUD
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db import crud, schemas

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=list[schemas.TicketRead])
def list_tickets(
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Liste tous les tickets, avec filtre optionnel par statut."""
    return crud.list_tickets(db, statut=statut, skip=skip, limit=limit)


@router.get("/{ticket_id}", response_model=schemas.TicketRead)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Récupère un ticket par son ID."""
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return ticket


@router.get("/{ticket_id}/history", response_model=list[schemas.TicketLogRead])
def get_ticket_history(ticket_id: str, db: Session = Depends(get_db)):
    """Récupère l'historique complet des échanges d'un ticket."""
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return crud.get_ticket_history(db, ticket_id)


@router.patch("/{ticket_id}", response_model=schemas.TicketRead)
def update_ticket(ticket_id: str, update: schemas.TicketUpdate, db: Session = Depends(get_db)):
    """Met à jour partiellement un ticket (statut, priorité, équipe...)."""
    ticket = crud.update_ticket(db, ticket_id, update)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return ticket
