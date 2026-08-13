import { Label, labels } from "./labels";
import { Status, statuses } from "./statuses";
import { User, users } from "./users";

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
  assignees: User[];
  labels: Label[];
  date?: string;
  comments: number;
  attachments: number;
  links: number;
  progress: { completed: number; total: number };
  priority: "low" | "medium" | "high" | "urgent" | "no-priority";
  conversation?: Message[];
  evaluation?: AIEvaluation;
}

export const tasks: Task[] = [
  // En Cours
  {
    id: "TCK-2026-001",
    title: "Plus de connexion Wi-Fi",
    description: "Le Wi-Fi ne fonctionne plus au 3ème étage, plusieurs utilisateurs sont impactés.",
    status: statuses[0], // EN_COURS
    assignees: [users[0]],
    labels: [labels[0], labels[4]],
    date: "Aujourd'hui",
    comments: 2,
    attachments: 0,
    links: 1,
    progress: { completed: 1, total: 3 },
    priority: "urgent",
    evaluation: {
      confidenceScore: 92,
      diagnostic: "Problème d'infrastructure réseau affectant une zone entière (3ème étage).",
      urgencyReason: "Impact sur de multiples utilisateurs simultanément. Perturbation majeure de la productivité.",
    },
    conversation: [
      { id: "m1", role: "user", content: "Bonjour, je n'ai plus de Wi-Fi depuis 10 minutes. Je suis au 3ème étage, bureau 304.", timestamp: "10:15" },
      { id: "m2", role: "agent", content: "Bonjour. Je vérifie les sondes réseau. Avez-vous une erreur spécifique qui s'affiche sur votre ordinateur ?", timestamp: "10:15" },
      { id: "m3", role: "user", content: "Non, juste le réseau 'ISPM-Corp' qui a disparu. Mes collègues du bureau d'à côté ont le même problème.", timestamp: "10:16" },
      { id: "m4", role: "agent", content: "Merci pour cette précision. Je détecte effectivement une perte de signal sur la borne AP-300-Nord. Je qualifie cet incident en urgence P1 car il impacte plusieurs collaborateurs. Le service Infra Réseau est notifié.", timestamp: "10:17" }
    ]
  },
  {
    id: "TCK-2026-002",
    title: "Installation nouveau logiciel",
    description: "Besoin d'installer AutoCAD sur le poste PC-045.",
    status: statuses[0], // EN_COURS
    assignees: [users[1]],
    labels: [labels[2], labels[6]],
    date: "Hier",
    comments: 0,
    attachments: 0,
    links: 0,
    progress: { completed: 0, total: 1 },
    priority: "medium",
    evaluation: {
      confidenceScore: 98,
      diagnostic: "Demande logicielle standard avec licence disponible.",
      urgencyReason: "Ne bloque pas complètement l'utilisateur, mais nécessaire pour ses projets en cours.",
    },
    conversation: [
      { id: "m5", role: "user", content: "Pouvez-vous m'installer AutoCAD s'il vous plaît ? J'ai un nouveau projet.", timestamp: "09:00" },
      { id: "m6", role: "agent", content: "Bien sûr. Avez-vous déjà l'approbation de votre manager pour l'attribution de la licence ?", timestamp: "09:01" },
      { id: "m7", role: "user", content: "Oui, c'est validé par M. Martin.", timestamp: "09:03" },
      { id: "m8", role: "agent", content: "Parfait, je crée le ticket pour le service Support N1. Un technicien va prendre la main à distance dans la journée.", timestamp: "09:03" }
    ]
  },

  // En Attente
  {
    id: "TCK-2026-003",
    title: "Mot de passe Outlook oublié",
    description: "L'utilisateur n'arrive pas à se connecter, attente de confirmation de son identité.",
    status: statuses[1], // EN_ATTENTE_UTILISATEUR
    assignees: [users[2]],
    labels: [labels[3], labels[5]],
    date: "Il y a 2 jours",
    comments: 1,
    attachments: 0,
    links: 0,
    progress: { completed: 0, total: 0 },
    priority: "low",
    evaluation: {
      confidenceScore: 85,
      diagnostic: "Verrouillage de compte suite à des tentatives infructueuses.",
      urgencyReason: "Bloquant pour l'utilisateur, mais contournable via procédure standard.",
    },
    conversation: [
      { id: "m9", role: "user", content: "Je n'arrive plus à me connecter à Outlook, ça me dit mot de passe incorrect.", timestamp: "11:30" },
      { id: "m10", role: "agent", content: "Je vois que votre compte a été verrouillé après 3 tentatives. Pour des raisons de sécurité, veuillez confirmer votre identité avec le code envoyé par SMS.", timestamp: "11:31" },
      { id: "m11", role: "user", content: "D'accord, j'attends le SMS.", timestamp: "11:35" }
    ]
  },

  // Escaladé
  {
    id: "TCK-2026-004",
    title: "Accès refusé ERP Finance",
    description: "Erreur 403 lors de l'accès au module de paie. L'agent IA n'a pas les droits pour résoudre.",
    status: statuses[2], // ESCALADE
    assignees: [users[3]],
    labels: [labels[1], labels[7]],
    date: "Aujourd'hui",
    comments: 4,
    attachments: 2,
    links: 1,
    progress: { completed: 1, total: 4 },
    priority: "high",
    evaluation: {
      confidenceScore: 100,
      diagnostic: "Erreur d'authentification 403. Problème de droits sur l'ERP.",
      urgencyReason: "Bloque un processus métier critique (Paie).",
      escalationReason: "L'agent IA ne possède pas l'habilitation nécessaire pour modifier les groupes de sécurité ERP."
    },
    conversation: [
      { id: "m12", role: "user", content: "Gros problème, je ne peux pas valider la paie ! L'ERP me donne une Erreur 403.", timestamp: "14:00" },
      { id: "m13", role: "agent", content: "L'erreur 403 indique un refus de droits d'accès. Avez-vous changé de département ou de poste récemment ?", timestamp: "14:00" },
      { id: "m14", role: "user", content: "Oui, je viens de passer responsable RH ce matin.", timestamp: "14:02" },
      { id: "m15", role: "agent", content: "Félicitations. La mise à jour de vos groupes de sécurité n'a pas dû se propager à l'ERP. N'ayant pas les droits pour forcer cette propagation, j'escalade immédiatement ce ticket à l'Administration Système (P2 Haute).", timestamp: "14:02" }
    ]
  },
  {
    id: "TCK-2026-005",
    title: "Serveur de fichiers inaccessible",
    description: "Le lecteur réseau Z: ne répond plus.",
    status: statuses[2], // ESCALADE
    assignees: [],
    labels: [labels[0], labels[4]],
    date: "Aujourd'hui",
    comments: 0,
    attachments: 0,
    links: 0,
    progress: { completed: 0, total: 5 },
    priority: "urgent",
    evaluation: {
      confidenceScore: 70,
      diagnostic: "Perte de connexion au serveur de fichiers. Cause inconnue.",
      urgencyReason: "Impact majeur sur la production de tous les collaborateurs.",
      escalationReason: "Nécessite une investigation physique et réseau par un humain."
    },
    conversation: [
      { id: "m16", role: "user", content: "Le lecteur Z: a disparu.", timestamp: "08:15" },
      { id: "m17", role: "agent", content: "Avez-vous essayé de redémarrer votre poste ?", timestamp: "08:15" },
      { id: "m18", role: "user", content: "Oui. Et tout l'open space a le même souci !", timestamp: "08:20" },
      { id: "m19", role: "agent", content: "Je constate que le serveur ne répond plus au ping de diagnostic. J'escalade immédiatement ce ticket critique à l'Infra Réseau.", timestamp: "08:20" }
    ]
  },

  // Résolu
  {
    id: "TCK-2026-006",
    title: "Demande de clavier",
    description: "Remplacement du clavier défectueux sur le poste de l'accueil.",
    status: statuses[3], // RESOLU
    assignees: [users[1]],
    labels: [labels[3], labels[8]],
    date: "Semaine dernière",
    comments: 1,
    attachments: 0,
    links: 0,
    progress: { completed: 1, total: 1 },
    priority: "low",
    evaluation: {
      confidenceScore: 99,
      diagnostic: "Défaillance matérielle mineure.",
      urgencyReason: "Poste d'accueil mais clavier de secours disponible.",
    },
    conversation: [
      { id: "m20", role: "user", content: "La touche 'E' de mon clavier est cassée à l'accueil.", timestamp: "16:00" },
      { id: "m21", role: "agent", content: "Je peux commander un remplacement. Êtes-vous complètement bloquée ?", timestamp: "16:01" },
      { id: "m22", role: "user", content: "Non j'ai pris celui d'un collègue absent en attendant.", timestamp: "16:02" },
      { id: "m23", role: "agent", content: "C'est noté. Je planifie l'intervention du service Maintenance pour la semaine prochaine.", timestamp: "16:02" }
    ]
  }
];

export function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const statusId = task.status.id;

    if (!acc[statusId]) {
      acc[statusId] = [];
    }

    acc[statusId].push(task);

    return acc;
  }, {});
}
