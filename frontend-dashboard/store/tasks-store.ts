import { create } from 'zustand';
import { Status, statuses } from '@/mock-data/statuses';
import { fetchTickets, fetchTicketHistory, patchTicket, Ticket } from '@/lib/api';
import type { TicketLog } from '@/lib/api';

// ── Mapping Backend → Dashboard ────────────────────────────────────────────
// Convertit un ticket backend en Task affichable dans le Kanban
const PRIORITY_LABEL: Record<string, string> = {
  P1_critique: "🚨 P1 Critique",
  P2_haute: "🔴 P2 Haute",
  P3_moyenne: "🟡 P3 Moyenne",
  P4_basse: "🟢 P4 Basse",
};

const PRIORITY_COLOR: Record<string, string> = {
  P1_critique: "bg-red-500/10 text-red-600 border border-red-500/30",
  P2_haute: "bg-orange-500/10 text-orange-600 border border-orange-500/30",
  P3_moyenne: "bg-yellow-500/10 text-yellow-700 border border-yellow-500/30",
  P4_basse: "bg-green-500/10 text-green-700 border border-green-500/30",
};

const SERVICE_LABEL: Record<string, string> = {
  infrastructure_reseau: "Infra Réseau",
  cybersecurite: "Cybersécurité",
  support_n1: "Support N1",
  admin_systeme: "Admin Système",
  maintenance_materiel: "Maintenance",
};

const CATEGORY_LABEL: Record<string, string> = {
  comptes_et_authentification: "🔑 Comptes & Authentification",
  reseau_et_connectivite: "🌐 Réseau & Connectivité",
  materiel_informatique: "💻 Matériel Informatique",
  logiciels_et_applications: "📦 Logiciels & Applications",
  imprimantes_et_peripheriques: "🖨️ Imprimantes & Périphériques",
  droits_d_acces: "🛡️ Droits d'Accès",
  cybersecurite: "🚨 Cybersécurité",
  incertain_non_compris: "🤷 Incertain / Non compris",
  autre_indetermine: "❓ Autre / Indéterminé"
};

const CATEGORY_COLOR: Record<string, string> = {
  comptes_et_authentification: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30",
  reseau_et_connectivite: "bg-sky-500/10 text-sky-700 border border-sky-500/30",
  materiel_informatique: "bg-amber-500/10 text-amber-700 border border-amber-500/30",
  logiciels_et_applications: "bg-indigo-500/10 text-indigo-700 border border-indigo-500/30",
  imprimantes_et_peripheriques: "bg-teal-500/10 text-teal-700 border border-teal-500/30",
  droits_d_acces: "bg-purple-500/10 text-purple-700 border border-purple-500/30",
  cybersecurite: "bg-rose-500/10 text-rose-700 border border-rose-500/30",
  incertain_non_compris: "bg-fuchsia-500/10 text-fuchsia-700 border border-fuchsia-500/30",
  autre_indetermine: "bg-slate-500/10 text-slate-700 border border-slate-500/30"
};

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export interface AIEvaluation {
  confidenceScore: number;
  diagnostic: string;
  urgencyReason: string;
  escalationReason?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  labels: Label[];
  assignees: unknown[];
  date?: string;
  comments: number;
  attachments: number;
  links: number;
  progress: { completed: number; total: number };
  priority: string;
  conversation?: Message[];
  evaluation?: AIEvaluation;
}

// Transforme un ticket backend en Task Kanban
function ticketToTask(ticket: Ticket, logs?: TicketLog[]): Task {
  const statusObj = statuses.find((s) => s.id === ticket.statut) || statuses[0];

  const labels: Label[] = [];
  if (ticket.priorite && PRIORITY_LABEL[ticket.priorite]) {
    labels.push({
      id: `priority-${ticket.priorite}`,
      name: PRIORITY_LABEL[ticket.priorite],
      color: PRIORITY_COLOR[ticket.priorite] || "",
    });
  }
  if (ticket.equipe_affectee) {
    labels.push({
      id: `service-${ticket.equipe_affectee}`,
      name: `🔧 ${SERVICE_LABEL[ticket.equipe_affectee] || ticket.equipe_affectee}`,
      color: "bg-blue-500/10 text-blue-700 border border-blue-500/30",
    });
  }
  if (ticket.categorie && CATEGORY_LABEL[ticket.categorie]) {
    labels.push({
      id: `category-${ticket.categorie}`,
      name: CATEGORY_LABEL[ticket.categorie],
      color: CATEGORY_COLOR[ticket.categorie] || "",
    });
  }

  const conversation: Message[] = (logs || []).map((log) => ({
    id: `log-${log.id}`,
    role: log.auteur === "USER" ? "user" : "agent",
    content: log.message,
    timestamp: new Date(log.horodatage).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  }));

  const evaluation: AIEvaluation | undefined = ticket.diagnostic ? {
    confidenceScore: Math.round(ticket.confiance_score * 100),
    diagnostic: ticket.diagnostic,
    urgencyReason: ticket.raison_urgence || "Analyse automatique",
    escalationReason: ticket.raison_escalade || undefined,
  } : undefined;

  return {
    id: ticket.id,
    title: ticket.titre,
    description: ticket.description_originale || ticket.titre,
    status: statusObj,
    labels,
    assignees: [],
    date: new Date(ticket.date_creation).toLocaleDateString("fr-FR"),
    comments: conversation.length,
    attachments: 0,
    links: 0,
    progress: { completed: ticket.statut === "RESOLU" ? 1 : 0, total: 1 },
    priority: ticket.priorite || "no-priority",
    conversation: conversation.length > 0 ? conversation : undefined,
    evaluation,
  };
}

export function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  return statuses.reduce((acc, status) => {
    acc[status.id] = tasks.filter((t) => t.status.id === status.id);
    return acc;
  }, {} as Record<string, Task[]>);
}

// ── Store ───────────────────────────────────────────────────────────────────
interface TasksState {
  tasks: Task[];
  tasksByStatus: Record<string, Task[]>;
  isLoading: boolean;
  error: string | null;
  lastFetch: number;

  fetchTasks: () => Promise<void>;
  fetchTaskWithHistory: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Status) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  tasksByStatus: groupTasksByStatus([]),
  isLoading: false,
  error: null,
  lastFetch: 0,

  fetchTasks: async () => {
    // Éviter les appels trop fréquents (throttle 10s)
    if (Date.now() - get().lastFetch < 10000) return;
    
    set({ isLoading: true, error: null });
    try {
      const tickets = await fetchTickets();
      const tasks = tickets.map((t) => ticketToTask(t));
      set({
        tasks,
        tasksByStatus: groupTasksByStatus(tasks),
        isLoading: false,
        lastFetch: Date.now(),
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Erreur de chargement",
      });
    }
  },

  fetchTaskWithHistory: async (taskId: string) => {
    try {
      const logs = await fetchTicketHistory(taskId);
      set((state) => {
        const newTasks = state.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const conversation: Message[] = logs.map((log) => ({
            id: `log-${log.id}`,
            role: log.auteur === "USER" ? "user" : "agent",
            content: log.message,
            timestamp: new Date(log.horodatage).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          }));
          return { ...task, conversation, comments: conversation.length };
        });
        return { tasks: newTasks, tasksByStatus: groupTasksByStatus(newTasks) };
      });
    } catch (err) {
      console.error("Erreur de chargement de l'historique:", err);
    }
  },

  updateTaskStatus: (taskId, status) => {
    // Mise à jour optimiste locale + sync backend
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      return { tasks: newTasks, tasksByStatus: groupTasksByStatus(newTasks) };
    });
    // Sync vers le backend (fire & forget)
    patchTicket(taskId, { statut: status.id }).catch(console.error);
  },

  addTask: (task) =>
    set((state) => {
      const newTasks = [...state.tasks, task];
      return { tasks: newTasks, tasksByStatus: groupTasksByStatus(newTasks) };
    }),

  updateTask: (taskId, updates) =>
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      return { tasks: newTasks, tasksByStatus: groupTasksByStatus(newTasks) };
    }),

  deleteTask: (taskId) =>
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.id !== taskId);
      return { tasks: newTasks, tasksByStatus: groupTasksByStatus(newTasks) };
    }),
}));
