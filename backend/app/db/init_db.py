"""
Initialisation de la base de données et données de seed.
"""
from app.db.database import engine, SessionLocal
from app.db.models import Base
from app.db import crud, schemas


def init_database():
    """Crée toutes les tables si elles n'existent pas."""
    print("🗄️  Initialisation de la base de données...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées.")
    _seed_data()


def _seed_data():
    """Insère les données de démonstration."""
    db = SessionLocal()
    try:
        # Vérifier si des données existent déjà
        from app.db.models import Utilisateur
        if db.query(Utilisateur).count() > 0:
            print("ℹ️  Les données de seed existent déjà, skip.")
            return

        print("🌱 Insertion des données de démonstration...")

        # Utilisateurs
        utilisateurs = [
            schemas.UtilisateurCreate(
                id="USR-001", nom="Marie Dupont", email="m.dupont@ispm.fr",
                departement="Comptabilité", role="user"
            ),
            schemas.UtilisateurCreate(
                id="USR-002", nom="Jean Martin", email="j.martin@ispm.fr",
                departement="Informatique", role="technicien"
            ),
            schemas.UtilisateurCreate(
                id="USR-003", nom="Sophie Bernard", email="s.bernard@ispm.fr",
                departement="Ressources Humaines", role="user"
            ),
            schemas.UtilisateurCreate(
                id="USR-004", nom="Admin ISPM", email="admin@ispm.fr",
                departement="DSI", role="admin"
            ),
        ]
        for u in utilisateurs:
            crud.create_utilisateur(db, u)

        print(f"✅ {len(utilisateurs)} utilisateurs créés.")

        print("✅ Données de démonstration (utilisateurs) insérées avec succès.")

    except Exception as e:
        print(f"❌ Erreur lors du seed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
