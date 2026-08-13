/**
 * Client HTTP vers le backend FastAPI mAIntenance
 * Connexion réelle au backend — suppression du mode fictif.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface ChatRequest {
  message: string;
  user_id: string;
  ticket_id?: string;
}

export interface AgentResponse {
  meta: {
    ticket_id: string;
    est_reprise: boolean;
    timestamp: string;
    latence_ms: number;
  };
  classification: {
    categorie: string;
    priorite: string;
    equipe_affectee: string;
    confiance: number;
  };
  diagnostic: {
    complet: boolean;
    symptome: string;
    informations_manquantes: string[];
  };
  decision: {
    action: string;
    validation_humaine_requise: boolean;
    statut_ticket: string;
  };
  execution: {
    sources_consultees: string[];
    outils_appeles: Array<{
      outil: string;
      parametres: Record<string, unknown>;
      resultat: string;
    }>;
  };
  reponse_client: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<AgentResponse> {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur backend ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<AgentResponse>;
}

export async function getTickets(statut?: string): Promise<AgentResponse[]> {
  const url = statut
    ? `${BACKEND_URL}/tickets?statut=${encodeURIComponent(statut)}`
    : `${BACKEND_URL}/tickets`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  return response.json();
}

export async function getTicketHistory(ticketId: string) {
  const response = await fetch(`${BACKEND_URL}/tickets/${ticketId}/history`);
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  return response.json();
}

export async function updateTicket(ticketId: string, data: Record<string, unknown>) {
  const response = await fetch(`${BACKEND_URL}/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  return response.json();
}
