/**
 * Client API pour le dashboard technicien
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
  await new Promise(r => setTimeout(r, 500));
  const mockTickets: Ticket[] = [
    {
      id: "TCK-2026-001",
      utilisateur_id: "USR-001",
      titre: "Plus de connexion Wi-Fi (Mock)",
      description_originale: "Le Wi-Fi ne fonctionne plus au 3ème étage.",
      categorie: "reseau_et_connectivite",
      priorite: "P1_critique",
      equipe_affectee: "infrastructure_reseau",
      statut: "ESCALADE",
      confiance_score: 0.9,
      validation_humaine_requise: false,
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString(),
    },
    {
      id: "TCK-2026-002",
      utilisateur_id: "USR-003",
      titre: "Mot de passe Outlook oublié (Mock)",
      description_originale: "Je n'arrive pas à me connecter à ma boîte mail.",
      categorie: "compte_et_acces",
      priorite: "P3_moyenne",
      equipe_affectee: "support_n1",
      statut: "EN_COURS",
      confiance_score: 0.95,
      validation_humaine_requise: false,
      date_creation: new Date(Date.now() - 86400000).toISOString(),
      date_mise_a_jour: new Date().toISOString(),
    },
    {
      id: "TCK-2026-003",
      utilisateur_id: "USR-002",
      titre: "Accès refusé au dossier partagé (Mock)",
      description_originale: "Je ne peux pas ouvrir le dossier des RH.",
      categorie: "compte_et_acces",
      priorite: "P4_basse",
      equipe_affectee: "support_n1",
      statut: "RESOLU",
      confiance_score: 0.88,
      validation_humaine_requise: false,
      date_creation: new Date(Date.now() - 172800000).toISOString(),
      date_mise_a_jour: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
  return statut ? mockTickets.filter(t => t.statut === statut) : mockTickets;
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const tickets = await fetchTickets();
  return tickets.find(t => t.id === id) || tickets[0];
}

export async function fetchTicketHistory(id: string): Promise<TicketLog[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    {
      id: 1,
      ticket_id: id,
      auteur: "USER",
      message: "Bonjour, je n'ai plus accès à internet.",
      outils_appeles: [],
      sources_citees: [],
      latence_ms: 0,
      tokens_utilises: 0,
      horodatage: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      ticket_id: id,
      auteur: "AGENT",
      message: "Bonjour. Je vais analyser votre problème (Données fictives).",
      outils_appeles: [{outil: "verifier_etat_service", parametres: {service_name: "internet"}, resultat: "Panne générale détectée"}],
      sources_citees: ["KB-NET-01"],
      latence_ms: 1200,
      tokens_utilises: 450,
      horodatage: new Date(Date.now() - 3500000).toISOString()
    }
  ];
}

export async function patchTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
  await new Promise(r => setTimeout(r, 500));
  return { ...(await fetchTicket(id)), ...data };
}

export async function fetchMetrics(): Promise<SystemMetrics> {
  await new Promise(r => setTimeout(r, 300));
  return {
    total_requests: 142,
    total_resolved: 98,
    total_escalated: 30,
    total_refused: 14,
    avg_latency_ms: 840,
    total_tokens: 154000,
    taux_resolution: 69.0,
    taux_escalade: 21.1,
    nb_traces: 142,
  };
}

export async function fetchTraces(limit = 50): Promise<unknown[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    {
      ticket_id: "TCK-2026-001",
      timestamp: new Date().toISOString(),
      latence_ms: 950,
      action: "escalade_technicien",
      confiance: 0.92,
      outils: ["verifier_etat_service"],
      sources: ["KB-NET-01"],
      erreur: null,
    }
  ];
}
