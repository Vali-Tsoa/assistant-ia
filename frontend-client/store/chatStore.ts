/**
 * Zustand store — État global du chat (messages + ticket courant)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentResponse } from "@/lib/api";

export type MessageRole = "user" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentResponse?: AgentResponse;
  isLoading?: boolean;
}

export interface TicketState {
  id: string | null;
  statut: string | null;
  priorite: string | null;
  categorie: string | null;
  confiance: number | null;
  validationHumaineRequise: boolean;
}

interface ChatStore {
  // Messages
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  // Ticket courant
  ticket: TicketState;
  setTicket: (ticket: Partial<TicketState>) => void;
  resetTicket: () => void;

  // État UI
  isLoading: boolean;
  setLoading: (val: boolean) => void;

  // Réinitialisation complète
  reset: () => void;

  // Charger un ticket historique
  loadConversation: (messages: ChatMessage[], ticket: TicketState) => void;

  // Utilisateur
  userId: string;
  setUserId: (id: string) => void;
}

const DEFAULT_TICKET: TicketState = {
  id: null,
  statut: null,
  priorite: null,
  categorie: null,
  confiance: null,
  validationHumaineRequise: false,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      userId: "USR-001",
      ticket: DEFAULT_TICKET,

      addMessage: (msg) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const timestamp = new Date().toISOString();
        set((state) => ({
          messages: [...state.messages, { ...msg, id, timestamp }],
        }));
        return id;
      },

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      clearMessages: () => set({ messages: [], ticket: DEFAULT_TICKET }),

      setTicket: (ticket) =>
        set((state) => ({ ticket: { ...state.ticket, ...ticket } })),

      resetTicket: () => set({ ticket: DEFAULT_TICKET }),

      setLoading: (val) => set({ isLoading: val }),

      reset: () => set({ messages: [], ticket: DEFAULT_TICKET, isLoading: false }),

      loadConversation: (messages, ticket) => set({ messages, ticket, isLoading: false }),

      setUserId: (id) => set({ userId: id }),
    }),
    {
      name: "chat-store-history",
      partialize: (state) => ({
        messages: state.messages,
        ticket: state.ticket,
        userId: state.userId,
      }),
    }
  )
);
