"use client";

import { useEffect, useState } from "react";
import { useAlertsStore, SecurityAlert } from "@/store/alerts-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const THREAT_COLORS: Record<string, string> = {
  prompt_injection: "bg-red-500/10 text-red-700 border border-red-500/30",
  sensitive_data_exposure: "bg-orange-500/10 text-orange-700 border border-orange-500/30",
  high_risk_action: "bg-yellow-500/10 text-yellow-700 border border-yellow-500/30",
  sensitive_data_in_output: "bg-purple-500/10 text-purple-700 border border-purple-500/30",
  malformed_output: "bg-slate-500/10 text-slate-700 border border-slate-500/30",
};

const THREAT_BG: Record<string, string> = {
  prompt_injection: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20",
  sensitive_data_exposure: "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20",
  high_risk_action: "border-yellow-200 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-950/20",
  sensitive_data_in_output: "border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/20",
  malformed_output: "border-slate-200 bg-slate-50 dark:border-slate-900/40 dark:bg-slate-950/20",
};

function AlertCard({ alert }: { alert: SecurityAlert }) {
  const { resolveAlert } = useAlertsStore();
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    await resolveAlert(alert.id);
    setResolving(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        THREAT_BG[alert.threat_type] || "border-border bg-card",
        alert.resolved && "opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {alert.resolved ? (
            <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="size-5 text-red-600 shrink-0 animate-pulse" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs font-semibold", THREAT_COLORS[alert.threat_type])}>
                {alert.threat_label}
              </Badge>
              {alert.resolved && (
                <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  ✅ Traité
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {alert.ticket_id && <span className="font-mono">{alert.ticket_id}</span>}
              {alert.utilisateur_id && <span>{alert.utilisateur_id}</span>}
              {alert.horodatage && (
                <span>{new Date(alert.horodatage).toLocaleString("fr-FR")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!alert.resolved && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-emerald-700 hover:bg-emerald-500/10"
              onClick={handleResolve}
              disabled={resolving}
            >
              {resolving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle className="size-3.5" />
              )}
              Marquer traité
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-current/10 pt-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-sm leading-relaxed">{alert.threat_description}</p>
          </div>
          {alert.threat_detail && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Détail technique
              </p>
              <code className="text-xs bg-background/60 px-2 py-1 rounded border border-border block break-all">
                {alert.threat_detail}
              </code>
            </div>
          )}
          {alert.message_original && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Message original intercepté
              </p>
              <blockquote className="text-xs italic bg-background/60 px-3 py-2 rounded border-l-4 border-red-400 text-muted-foreground break-all">
                {alert.message_original}
              </blockquote>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AlertsPanel({ compact = false }: { compact?: boolean }) {
  const { alerts, isLoading, error, fetchAlerts } = useAlertsStore();

  useEffect(() => {
    fetchAlerts();
    // Polling toutes les 30s
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  if (compact) {
    // Version compacte pour la sidebar (juste les non résolues)
    return (
      <div className="space-y-2">
        {isLoading && alerts.length === 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {unresolved.slice(0, 3).map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        {unresolved.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground text-center py-3 italic">
            ✅ Aucune alerte active
          </p>
        )}
      </div>
    );
  }

  // Version complète pour la page dédiée
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="size-6 text-red-500" />
            Alertes Système de Sécurité
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tentatives de Prompt Injection, données sensibles et actions à haut risque détectées par les guardrails IA.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            useAlertsStore.setState({ lastFetch: 0 });
            fetchAlerts();
          }}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Non résolues */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="size-4 text-red-500" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-red-600">
            Alertes actives ({unresolved.length})
          </h3>
        </div>
        {unresolved.length === 0 && !isLoading ? (
          <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 p-8 text-center">
            <ShieldCheck className="size-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-700">Aucune alerte active</p>
            <p className="text-xs text-muted-foreground mt-1">Tous les messages sont conformes à la politique de sécurité.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unresolved.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* Résolues */}
      {resolved.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="size-4 text-emerald-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Alertes traitées ({resolved.length})
            </h3>
          </div>
          <div className="space-y-3">
            {resolved.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
