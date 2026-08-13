"""
Router API — Métriques & Observabilité
"""
from fastapi import APIRouter
from app.observability.tracer import get_metrics, get_recent_traces

router = APIRouter(prefix="/observability", tags=["Observabilité"])


@router.get("/metrics")
def get_system_metrics():
    """Retourne les métriques agrégées du système AI (latence, tokens, taux résolution)."""
    return get_metrics()


@router.get("/traces")
def get_traces(limit: int = 50):
    """Retourne les dernières traces d'exécution de l'agent."""
    return get_recent_traces(limit=limit)


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "mAIntenance Assistant Backend"}
