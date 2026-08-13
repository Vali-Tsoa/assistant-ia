/**
 * Client HTTP vers le backend FastAPI mAIntenance
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
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    meta: {
      ticket_id: request.ticket_id || "TCK-2026-MOCK",
      est_reprise: !!request.ticket_id,
      timestamp: new Date().toISOString(),
      latence_ms: 1500,
    },
    classification: {
      categorie: "reseau_et_connectivite",
      priorite: "P2_haute",
      equipe_affectee: "infrastructure_reseau",
      confiance: 0.92,
    },
    diagnostic: {
      complet: true,
      symptome: "Connexion réseau impossible",
      informations_manquantes: [],
    },
    decision: {
      action: "escalade_technicien",
      validation_humaine_requise: false,
      statut_ticket: "ESCALADE",
    },
    execution: {
      sources_consultees: ["KB-NET-01: Pannes d'équipement réseau"],
      outils_appeles: [
        {
          outil: "verifier_etat_service",
          parametres: { service_name: "reseau" },
          resultat: "Panne détectée",
        },
      ],
    },
    reponse_client: "J'ai bien analysé votre demande (Mode Fictif). Une panne réseau a été détectée et votre ticket a été escaladé à l'équipe infrastructure en priorité haute.",
  };
}

export async function getTickets(statut?: string) { return []; }
export async function getTicketHistory(ticketId: string) { return []; }
export async function updateTicket(ticketId: string, data: Record<string, unknown>) { return {}; }
