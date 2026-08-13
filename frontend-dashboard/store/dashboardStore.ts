/**
 * Zustand store — État du dashboard technicien
 */
import { create } from "zustand";
import type { Ticket, SystemMetrics } from "@/lib/api";

interface DashboardStore {
  // Tickets
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  selectedTicketId: string | null;
  setSelectedTicket: (id: string | null) => void;

  // Filtres
  statutFilter: string | null;
  setStatutFilter: (statut: string | null) => void;
  prioriteFilter: string | null;
  setPrioriteFilter: (priorite: string | null) => void;

  // Métriques
  metrics: SystemMetrics | null;
  setMetrics: (metrics: SystemMetrics) => void;

  // Vue
  viewMode: "kanban" | "table";
  setViewMode: (mode: "kanban" | "table") => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  selectedTicketId: null,
  setSelectedTicket: (id) => set({ selectedTicketId: id }),

  statutFilter: null,
  setStatutFilter: (statut) => set({ statutFilter: statut }),
  prioriteFilter: null,
  setPrioriteFilter: (priorite) => set({ prioriteFilter: priorite }),

  metrics: null,
  setMetrics: (metrics) => set({ metrics }),

  viewMode: "kanban",
  setViewMode: (mode) => set({ viewMode: mode }),
}));
