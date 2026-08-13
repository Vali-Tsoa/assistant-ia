"""
Router API — Métriques & Observabilité
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.observability.tracer import get_metrics, get_recent_traces
from app.db.database import get_db
from app.db.models import SecurityAlert

router = APIRouter(prefix="/observability", tags=["Observabilité"])


@router.get("/metrics")
def get_system_metrics(db: Session = Depends(get_db)):
    """Retourne les métriques agrégées du système AI depuis la BDD + mémoire."""
    from app.db.models import Ticket, TicketLog, SecurityAlert
    from sqlalchemy import func as sqlfunc

    # Métriques tickets (depuis BDD — persistantes)
    total_tickets = db.query(Ticket).count()
    total_resolved = db.query(Ticket).filter(Ticket.statut == "RESOLU").count()
    total_escalated = db.query(Ticket).filter(Ticket.statut == "ESCALADE").count()
    total_waiting = db.query(Ticket).filter(Ticket.statut == "EN_ATTENTE_UTILISATEUR").count()
    total_in_progress = db.query(Ticket).filter(Ticket.statut == "EN_COURS").count()

    # Latence moyenne depuis les logs
    avg_latency = db.query(sqlfunc.avg(TicketLog.latence_ms)).scalar() or 0.0
    max_latency = db.query(sqlfunc.max(TicketLog.latence_ms)).scalar() or 0
    total_tokens = db.query(sqlfunc.sum(TicketLog.tokens_utilises)).scalar() or 0
    total_logs = db.query(TicketLog).count()

    # Alertes sécurité
    total_alerts = db.query(SecurityAlert).count()
    total_unresolved_alerts = db.query(SecurityAlert).filter(SecurityAlert.resolved == False).count()
    alerts_by_type = (
        db.query(SecurityAlert.threat_type, sqlfunc.count(SecurityAlert.id))
        .group_by(SecurityAlert.threat_type)
        .all()
    )

    # Métriques en mémoire (courte session)
    mem_metrics = get_metrics()

    return {
        "total_tickets": total_tickets,
        "total_resolved": total_resolved,
        "total_escalated": total_escalated,
        "total_waiting": total_waiting,
        "total_in_progress": total_in_progress,
        "taux_resolution": round(total_resolved / total_tickets * 100, 1) if total_tickets > 0 else 0,
        "taux_escalade": round(total_escalated / total_tickets * 100, 1) if total_tickets > 0 else 0,
        "avg_latency_ms": round(float(avg_latency), 1),
        "max_latency_ms": int(max_latency),
        "total_tokens": int(total_tokens),
        "total_logs": total_logs,
        "total_alerts": total_alerts,
        "total_unresolved_alerts": total_unresolved_alerts,
        "alerts_by_type": {row[0]: row[1] for row in alerts_by_type},
        # Métriques session courante (RAM)
        "session_requests": mem_metrics.get("total_requests", 0),
        "session_avg_latency_ms": mem_metrics.get("avg_latency_ms", 0),
    }


@router.get("/traces")
def get_traces(limit: int = 50):
    """Retourne les dernières traces d'exécution de l'agent."""
    return get_recent_traces(limit=limit)


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "mAIntenance Assistant Backend"}


@router.get("/alerts")
def get_security_alerts(
    resolved: Optional[bool] = Query(None, description="Filtrer par statut résolu"),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """
    Retourne les alertes de sécurité détectées par les guardrails.
    Inclut: prompt injections, données sensibles, actions à haut risque.
    """
    query = db.query(SecurityAlert).order_by(SecurityAlert.horodatage.desc())
    if resolved is not None:
        query = query.filter(SecurityAlert.resolved == resolved)
    alerts = query.limit(limit).all()

    from app.core.guardrails import THREAT_LABELS, THREAT_DESCRIPTIONS
    return [
        {
            "id": a.id,
            "ticket_id": a.ticket_id,
            "utilisateur_id": a.utilisateur_id,
            "threat_type": a.threat_type,
            "threat_label": THREAT_LABELS.get(a.threat_type, a.threat_type),
            "threat_detail": a.threat_detail,
            "threat_description": THREAT_DESCRIPTIONS.get(a.threat_type, ""),
            "message_original": a.message_original,
            "resolved": a.resolved,
            "horodatage": a.horodatage.isoformat() if a.horodatage else None,
        }
        for a in alerts
    ]


@router.patch("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Marque une alerte de sécurité comme traitée."""
    alert = db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alert.resolved = True
    db.commit()
    return {"success": True, "alert_id": alert_id}

