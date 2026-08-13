"use client";

import { useEffect, useState } from "react";
import { fetchMetrics } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Loader2,
  TrendingUp,
  Hash,
  ServerCrash,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Telemetry types ──────────────────────────────────────────────────────────
export interface SystemMetrics {
  total_tickets: number;
  total_resolved: number;
  total_escalated: number;
  total_waiting: number;
  total_in_progress: number;
  taux_resolution: number;
  taux_escalade: number;
  avg_latency_ms: number;
  max_latency_ms: number;
  total_tokens: number;
  total_logs: number;
  total_alerts: number;
  total_unresolved_alerts: number;
  alerts_by_type: Record<string, number>;
  session_requests: number;
  session_avg_latency_ms: number;
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "default" | "green" | "red" | "orange" | "blue" | "purple";
}) {
  const colorMap = {
    default: "bg-card border-border text-foreground",
    green: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700",
    red: "bg-red-500/5 border-red-500/20 text-red-700",
    orange: "bg-orange-500/5 border-orange-500/20 text-orange-700",
    blue: "bg-blue-500/5 border-blue-500/20 text-blue-700",
    purple: "bg-purple-500/5 border-purple-500/20 text-purple-700",
  };

  return (
    <div className={cn("rounded-xl border p-4 space-y-2 shadow-sm", colorMap[color])}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Telemetry panel ──────────────────────────────────────────────────────────
export function TelemetryPanel() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMetrics();
      setMetrics(data as unknown as SystemMetrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700">
        ⚠️ {error}
      </div>
    );
  }

  if (!metrics) return null;

  const THREAT_LABELS: Record<string, string> = {
    prompt_injection: "🚨 Prompt Injection",
    sensitive_data_exposure: "🔒 Données sensibles",
    high_risk_action: "⚠️ Action à haut risque",
    sensitive_data_in_output: "🔒 Données (sortie)",
    malformed_output: "⚙️ Sortie malformée",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="size-6 text-blue-500" />
            Télémétrie du Système mAIntenance IA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Métriques de performance de l&apos;agent LLM et de la base de données.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Section Tickets */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="size-4" />
          Tickets d&apos;Incidents
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<Hash className="size-4" />}
            label="Total"
            value={metrics.total_tickets}
            sub="Tickets créés"
          />
          <StatCard
            icon={<CheckCircle2 className="size-4" />}
            label="Résolus"
            value={metrics.total_resolved}
            sub={`${metrics.taux_resolution}% du total`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="size-4" />}
            label="En cours"
            value={metrics.total_in_progress}
            sub="Traitement actif"
            color="blue"
          />
          <StatCard
            icon={<Clock className="size-4" />}
            label="En attente"
            value={metrics.total_waiting}
            sub="Attente utilisateur"
            color="orange"
          />
          <StatCard
            icon={<ServerCrash className="size-4" />}
            label="Escaladés"
            value={metrics.total_escalated}
            sub={`${metrics.taux_escalade}% du total`}
            color="red"
          />
        </div>
      </section>

      {/* Section Performance IA */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Zap className="size-4" />
          Performance de l&apos;Agent IA (Gemini)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Clock className="size-4" />}
            label="Latence moy."
            value={`${metrics.avg_latency_ms} ms`}
            sub="Temps de réponse moyen"
            color="blue"
          />
          <StatCard
            icon={<Clock className="size-4" />}
            label="Latence max"
            value={`${metrics.max_latency_ms} ms`}
            sub="Pire cas enregistré"
            color={metrics.max_latency_ms > 5000 ? "red" : "orange"}
          />
          <StatCard
            icon={<Hash className="size-4" />}
            label="Tokens totaux"
            value={metrics.total_tokens.toLocaleString()}
            sub="Consommation LLM cumulée"
            color="purple"
          />
          <StatCard
            icon={<Activity className="size-4" />}
            label="Échanges"
            value={metrics.total_logs}
            sub="Messages dans les logs"
          />
        </div>

        {/* Latency bar visual */}
        {metrics.avg_latency_ms > 0 && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Indice de performance (latence moy. vs seuil 3000ms)
              </span>
              <span className="text-xs font-bold">
                {metrics.avg_latency_ms < 1000 ? "🟢 Excellent" :
                  metrics.avg_latency_ms < 2000 ? "🟡 Correct" :
                  metrics.avg_latency_ms < 3000 ? "🟠 Lent" : "🔴 Critique"}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  metrics.avg_latency_ms < 1000 ? "bg-emerald-500" :
                  metrics.avg_latency_ms < 2000 ? "bg-yellow-500" :
                  metrics.avg_latency_ms < 3000 ? "bg-orange-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, (metrics.avg_latency_ms / 3000) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Section Sécurité */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Shield className="size-4" />
          Sécurité — Guardrails
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            icon={<ShieldAlert className="size-4" />}
            label="Total alertes"
            value={metrics.total_alerts}
            sub="Toutes tentatives détectées"
            color={metrics.total_alerts > 0 ? "red" : "green"}
          />
          <StatCard
            icon={<AlertTriangle className="size-4" />}
            label="Non traitées"
            value={metrics.total_unresolved_alerts}
            sub="Nécessitent une attention"
            color={metrics.total_unresolved_alerts > 0 ? "orange" : "green"}
          />
          <StatCard
            icon={<CheckCircle2 className="size-4" />}
            label="Traitées"
            value={metrics.total_alerts - metrics.total_unresolved_alerts}
            sub="Alertes résolues"
            color="green"
          />
        </div>

        {/* Répartition par type */}
        {Object.keys(metrics.alerts_by_type).length > 0 && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Répartition par type de menace
            </p>
            <div className="space-y-2">
              {Object.entries(metrics.alerts_by_type).map(([type, count]) => {
                const max = Math.max(...Object.values(metrics.alerts_by_type));
                const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">{THREAT_LABELS[type] || type}</span>
                      <span className="text-xs font-bold tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/70 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Résolution rate visual */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="size-4" />
          Taux de Résolution
        </h3>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Résolution", value: metrics.taux_resolution, color: "bg-emerald-500" },
              { label: "Escalade", value: metrics.taux_escalade, color: "bg-orange-500" },
              {
                label: "En attente",
                value: metrics.total_tickets > 0 ? Math.round(metrics.total_waiting / metrics.total_tickets * 100) : 0,
                color: "bg-blue-500",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
