"""
Script de migration — Ajoute la table security_alerts.
Exécuter une seule fois après la mise à jour des modèles :
  python -m app.db.migrations.add_security_alerts
"""
from app.db.database import engine
from app.db.models import Base


def run():
    Base.metadata.create_all(bind=engine)
    print("✅ Table security_alerts créée (si elle n'existait pas).")


if __name__ == "__main__":
    run()
