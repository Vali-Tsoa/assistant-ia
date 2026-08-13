"""
Module d'observabilité — Enregistrement des traces et métriques.
"""
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class AgentTrace:
    """Trace complète d'un appel agent."""
    ticket_id: str
    user_id: str
    message_utilisateur: str
    timestamp_debut: str = field(default_factory=lambda: datetime.now().isoformat())
    timestamp_fin: str = ""
    latence_ms: int = 0
    tokens_prompt: int = 0
    tokens_completion: int = 0
    tokens_total: int = 0
    outils_appeles: list[str] = field(default_factory=list)
    sources_rag: list[str] = field(default_factory=list)
    action_decidee: str = ""
    confiance: float = 0.0
    erreur: str | None = None


# Stockage en mémoire (en prod → Prometheus + Grafana ou LangSmith)
_traces: list[AgentTrace] = []
_metrics = {
    "total_requests": 0,
    "total_resolved": 0,
    "total_escalated": 0,
    "total_refused": 0,
    "avg_latency_ms": 0.0,
    "total_tokens": 0,
}


def record_trace(trace: AgentTrace):
    """Enregistre une trace d'exécution agent."""
    _traces.append(trace)
    _update_metrics(trace)


def _update_metrics(trace: AgentTrace):
    """Met à jour les métriques agrégées."""
    _metrics["total_requests"] += 1
    _metrics["total_tokens"] += trace.tokens_total

    action = trace.action_decidee
    if action == "resolution_automatique":
        _metrics["total_resolved"] += 1
    elif action == "escalade_technicien":
        _metrics["total_escalated"] += 1
    elif action == "refus_securite":
        _metrics["total_refused"] += 1

    # Moyenne mobile de la latence
    n = _metrics["total_requests"]
    old_avg = _metrics["avg_latency_ms"]
    _metrics["avg_latency_ms"] = round((old_avg * (n - 1) + trace.latence_ms) / n, 2)


def get_metrics() -> dict[str, Any]:
    """Retourne les métriques agrégées."""
    total = _metrics["total_requests"]
    return {
        **_metrics,
        "taux_resolution": round(_metrics["total_resolved"] / total * 100, 1) if total > 0 else 0,
        "taux_escalade": round(_metrics["total_escalated"] / total * 100, 1) if total > 0 else 0,
        "nb_traces": len(_traces),
    }


def get_recent_traces(limit: int = 50) -> list[dict]:
    """Retourne les dernières traces pour le dashboard."""
    return [
        {
            "ticket_id": t.ticket_id,
            "timestamp": t.timestamp_debut,
            "latence_ms": t.latence_ms,
            "action": t.action_decidee,
            "confiance": t.confiance,
            "outils": t.outils_appeles,
            "sources": t.sources_rag,
            "erreur": t.erreur,
        }
        for t in _traces[-limit:][::-1]
    ]
