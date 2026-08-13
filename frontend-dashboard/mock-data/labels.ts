export interface Label {
  id: string;
  name: string;
  color: string;
}

export const labels: Label[] = [
  // --- Priorités ---
  {
    id: "p1-critique",
    name: "🚨 P1 Critique",
    color: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900",
  },
  {
    id: "p2-haute",
    name: "🔴 P2 Haute",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200 dark:border-orange-900",
  },
  {
    id: "p3-moyenne",
    name: "🟡 P3 Moyenne",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900",
  },
  {
    id: "p4-basse",
    name: "🟢 P4 Basse",
    color: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900",
  },

  // --- Services Assignés ---
  {
    id: "srv-reseau",
    name: "Service: Infra Réseau",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
  },
  {
    id: "srv-cyber",
    name: "Service: Cybersécurité",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
  },
  {
    id: "srv-support-n1",
    name: "Service: Support N1",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    id: "srv-sysadmin",
    name: "Service: Admin Système",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
  },
  {
    id: "srv-materiel",
    name: "Service: Maintenance Matériel",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400",
  },
];
