/**
 * Client WebSocket pour le chat en temps réel avec l'agent AI.
 */

const BACKEND_WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000";

export type WSMessageHandler = (data: Record<string, unknown>) => void;
export type WSErrorHandler = (error: Event) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private ticketId: string;
  private onMessage: WSMessageHandler;
  private onError?: WSErrorHandler;
  private reconnectAttempts = 0;
  private maxReconnects = 3;

  constructor(ticketId: string, onMessage: WSMessageHandler, onError?: WSErrorHandler) {
    this.ticketId = ticketId;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect() {
    console.log(`[WS-MOCK] Connecté au ticket fictif ${this.ticketId}`);
  }

  sendMessage(userId: string, message: string) {
    console.log(`[WS-MOCK] Message envoyé:`, message);
    
    // Simuler une réponse après 2 secondes
    setTimeout(() => {
      this.onMessage({
        meta: { ticket_id: this.ticketId, est_reprise: true, timestamp: new Date().toISOString(), latence_ms: 1200 },
        classification: { categorie: "reseau_et_connectivite", priorite: "P2_haute", equipe_affectee: "infrastructure_reseau", confiance: 0.95 },
        diagnostic: { complet: true, symptome: "Panne", informations_manquantes: [] },
        decision: { action: "demande_information", validation_humaine_requise: false, statut_ticket: "EN_COURS" },
        execution: { sources_consultees: [], outils_appeles: [] },
        reponse_client: "Message reçu par le WebSocket (Mode Fictif). Que puis-je faire d'autre ?",
      });
    }, 2000);
  }

  disconnect() {
    console.log("[WS-MOCK] Déconnecté");
  }

  get isConnected() {
    return true;
  }
}
