"use client";

import { useEffect, useState } from "react";
import { useAlertsStore } from "@/store/alerts-store";
import { fetchMetrics } from "@/lib/api";
import { AlertsPanel } from "@/components/alerts/alerts-panel";
import { TaskSidebar } from "@/components/task/sidebar/task-sidebar";
import { TaskHeader } from "@/components/task/header/task-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

import { TelemetryPanel } from "@/components/telemetry/telemetry-panel";

// ── Main page ────────────────────────────────────────────────────────────────
type Tab = "alerts" | "telemetry";

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("alerts");
  const { unresolvedCount } = useAlertsStore();
  const unresolved = unresolvedCount();

  return (
    <SidebarProvider>
      <TaskSidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <TaskHeader />
        <main className="flex-1 overflow-y-auto">
          {/* Tab bar */}
          <div className="border-b border-border bg-background px-6 pt-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("alerts")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors",
                  activeTab === "alerts"
                    ? "bg-background border-border text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldAlert className="size-4" />
                Alertes de Sécurité
                {unresolved > 0 && (
                  <span className="size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unresolved > 9 ? "9+" : unresolved}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors",
                  activeTab === "telemetry"
                    ? "bg-background border-border text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Activity className="size-4" />
                Télémétrie
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "alerts" ? <AlertsPanel /> : <TelemetryPanel />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
