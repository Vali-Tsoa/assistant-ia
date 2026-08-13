/**
 * Client WebSocket pour le chat en temps réel avec l'agent AI.
 * Connexion réelle au backend FastAPI — suppression du mode fictif.
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
  private reconnectDelay = 2000;

  constructor(ticketId: string, onMessage: WSMessageHandler, onError?: WSErrorHandler) {
    this.ticketId = ticketId;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect() {
    const url = `${BACKEND_WS_URL}/chat/ws/${this.ticketId}`;
    console.log(`[WS] Connexion à ${url}`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] Connecté au ticket ${this.ticketId}`);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        this.onMessage(data);
      } catch {
        console.error("[WS] Erreur de parsing JSON:", event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[WS] Erreur WebSocket:", error);
      this.onError?.(error);
    };

    this.ws.onclose = (event) => {
      console.log(`[WS] Déconnecté (code: ${event.code})`);
      // Tentative de reconnexion automatique sur fermeture inattendue
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        console.log(`[WS] Reconnexion ${this.reconnectAttempts}/${this.maxReconnects} dans ${this.reconnectDelay}ms...`);
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    };
  }

  sendMessage(userId: string, message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[WS] WebSocket non connecté, tentative de reconnexion...");
      this.connect();
      return;
    }
    const payload = JSON.stringify({ user_id: userId, message });
    console.log(`[WS] Envoi:`, payload);
    this.ws.send(payload);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Fermeture normale");
      this.ws = null;
      console.log("[WS] Déconnecté proprement.");
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
