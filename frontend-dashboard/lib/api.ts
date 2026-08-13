/**
 * Client API pour le dashboard technicien — Connexion réelle au backend FastAPI
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface Ticket {
  id: string;
  utilisateur_id: string;
  titre: string;
  description_originale: string | null;
  categorie: string | null;
  priorite: string | null;
  equipe_affectee: string | null;
  statut: string;
  confiance_score: number;
  validation_humaine_requise: boolean;
  diagnostic: string | null;
  raison_urgence: string | null;
  raison_escalade: string | null;
  date_creation: string;
  date_mise_a_jour: string;
}

export interface TicketLog {
  id: number;
  ticket_id: string;
  auteur: string;
  message: string;
  outils_appeles: unknown[];
  sources_citees: string[];
  latence_ms: number;
  tokens_utilises: number;
  horodatage: string;
}

export interface SystemMetrics {
  total_requests: number;
  total_resolved: number;
  total_escalated: number;
  total_refused: number;
  avg_latency_ms: number;
  total_tokens: number;
  taux_resolution: number;
  taux_escalade: number;
  nb_traces: number;
}

export async function fetchTickets(statut?: string): Promise<Ticket[]> {
  const url = statut
    ? `${BACKEND_URL}/tickets?statut=${encodeURIComponent(statut)}`
    : `${BACKEND_URL}/tickets`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${BACKEND_URL}/tickets/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function fetchTicketHistory(id: string): Promise<TicketLog[]> {
  const res = await fetch(`${BACKEND_URL}/tickets/${id}/history`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function patchTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch(`${BACKEND_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function fetchMetrics(): Promise<SystemMetrics> {
  try {
    const res = await fetch(`${BACKEND_URL}/observability/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
  } catch {
    // Fallback si l'endpoint n'existe pas encore
    return {
      total_requests: 0, total_resolved: 0, total_escalated: 0,
      total_refused: 0, avg_latency_ms: 0, total_tokens: 0,
      taux_resolution: 0, taux_escalade: 0, nb_traces: 0,
    };
  }
}

export async function fetchTraces(limit = 50): Promise<unknown[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/observability/traces?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
  } catch {
    return [];
  }
}

// ── Gestion de la Base de Connaissances (RAG) ──

export interface KBDocument {
  filename: string;
  title: string;
  content: string;
  size: number;
}

export async function fetchKBDocuments(): Promise<KBDocument[]> {
  const res = await fetch(`${BACKEND_URL}/knowledge`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function saveKBDocument(filename: string, content: string): Promise<{ success: boolean; chunks_indexed: number; message: string }> {
  const res = await fetch(`${BACKEND_URL}/knowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deleteKBDocument(filename: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BACKEND_URL}/knowledge/${filename}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}
