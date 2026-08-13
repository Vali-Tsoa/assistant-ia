"""
Modèles de données SQLAlchemy — Base de données centrale ISPM
Correspond exactement au schéma SQL du cahier des charges.
"""
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, Boolean,
    DateTime, ForeignKey, JSON, Integer
)
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Utilisateur(Base):
    """Table des utilisateurs du système."""
    __tablename__ = "utilisateurs"

    id = Column(String(50), primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    departement = Column(String(50))
    role = Column(String(50), default="user")  # user | technicien | admin

    tickets = relationship("Ticket", back_populates="utilisateur")

    def __repr__(self):
        return f"<Utilisateur {self.id}: {self.nom}>"


class Ticket(Base):
    """Table des tickets d'incident."""
    __tablename__ = "tickets"

    id = Column(String(50), primary_key=True, index=True)
    utilisateur_id = Column(String(50), ForeignKey("utilisateurs.id"), nullable=False)

    # Informations ticket
    titre = Column(String(255), nullable=False)
    description_originale = Column(Text)

    # Classification IA
    categorie = Column(String(50))        # reseau, materiel, compte, logiciel, autre
    priorite = Column(String(20))          # P1_critique, P2_haute, P3_moyenne, P4_basse
    equipe_affectee = Column(String(50))   # infrastructure_reseau, support_n1, etc.

    # Statut
    statut = Column(String(30), default="EN_COURS")
    # EN_COURS | EN_ATTENTE_UTILISATEUR | RESOLU | ESCALADE

    # Métriques IA
    confiance_score = Column(Float, default=0.0)
    validation_humaine_requise = Column(Boolean, default=False)

    # Timestamps
    date_creation = Column(DateTime, server_default=func.now())
    date_mise_a_jour = Column(DateTime, server_default=func.now(), onupdate=func.now())

    utilisateur = relationship("Utilisateur", back_populates="tickets")
    logs = relationship("TicketLog", back_populates="ticket", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Ticket {self.id}: {self.titre[:30]}... [{self.statut}]>"


class TicketLog(Base):
    """Historique des échanges d'un ticket (conversation + traces)."""
    __tablename__ = "ticket_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(50), ForeignKey("tickets.id"), nullable=False)

    auteur = Column(String(20))     # USER | AGENT | TECHNICIEN
    message = Column(Text)

    # Traces IA
    outils_appeles = Column(JSON, default=list)     # [{outil, parametres, resultat}]
    sources_citees = Column(JSON, default=list)     # ["KB-NET-01", ...]
    latence_ms = Column(Integer, default=0)
    tokens_utilises = Column(Integer, default=0)

    horodatage = Column(DateTime, server_default=func.now())

    ticket = relationship("Ticket", back_populates="logs")

    def __repr__(self):
        return f"<TicketLog #{self.id} [{self.auteur}] on {self.ticket_id}>"
