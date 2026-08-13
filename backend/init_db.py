import os
from sqlalchemy import create_engine
from app.db.models import Base
from app.config import settings

def init_db():
    print(f"Initialisation de la base de données : {settings.database_url}")
    # Paramètres SQLite spécifiques
    connect_args = {}
    if settings.database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    engine = create_engine(
        settings.database_url,
        connect_args=connect_args,
        echo=True,
    )
    
    # Création des tables
    Base.metadata.create_all(bind=engine)
    print("Base de données initialisée avec succès.")

if __name__ == "__main__":
    init_db()
