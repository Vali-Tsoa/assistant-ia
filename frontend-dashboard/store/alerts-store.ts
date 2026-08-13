/**
 * Store Zustand — Alertes de sécurité (Prompt Injection, données sensibles, etc.)
 */
import { create } from "zustand";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface SecurityAlert {
  id: number;
  ticket_id: string | null;
  utilisateur_id: string | null;
  threat_type: string;
  threat_label: string;
  threat_detail: string;
  threat_description: string;
  message_original: string;
  resolved: boolean;
  horodatage: string | null;
}

interface AlertsState {
  alerts: SecurityAlert[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number;

  fetchAlerts: () => Promise<void>;
  resolveAlert: (alertId: number) => Promise<void>;
  unresolvedCount: () => number;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,
  lastFetch: 0,

  fetchAlerts: async () => {
    if (Date.now() - get().lastFetch < 5000) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BACKEND_URL}/observability/alerts`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const alerts: SecurityAlert[] = await res.json();
      set({ alerts, isLoading: false, lastFetch: Date.now() });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Erreur de chargement",
      });
    }
  },

  resolveAlert: async (alertId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/observability/alerts/${alertId}/resolve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, resolved: true } : a
        ),
      }));
    } catch (err) {
      console.error("Erreur résolution alerte:", err);
    }
  },

  unresolvedCount: () => get().alerts.filter((a) => !a.resolved).length,
}));
