/**
 * TicketStatusBadge — Badge visuel du statut du ticket courant
 */
"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  EN_COURS: { label: "En cours", variant: "default", color: "bg-blue-500" },
  EN_ATTENTE_UTILISATEUR: { label: "En attente", variant: "secondary", color: "bg-yellow-500" },
  RESOLU: { label: "Résolu ✓", variant: "outline", color: "bg-green-500" },
  ESCALADE: { label: "Escaladé ↑", variant: "destructive", color: "bg-orange-500" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  P1_critique: { label: "P1 Critique", color: "bg-red-600 text-white" },
  P2_haute: { label: "P2 Haute", color: "bg-orange-500 text-white" },
  P3_moyenne: { label: "P3 Moyenne", color: "bg-yellow-500 text-black" },
  P4_basse: { label: "P4 Basse", color: "bg-green-500 text-white" },
};

interface TicketStatusBadgeProps {
  ticketId: string | null;
  statut: string | null;
  priorite: string | null;
  categorie: string | null;
  confiance: number | null;
  validationHumaineRequise: boolean;
}

export function TicketStatusBadge({
  ticketId,
  statut,
  priorite,
  categorie,
  confiance,
  validationHumaineRequise,
}: TicketStatusBadgeProps) {
  if (!ticketId) return null;

  const statusConf = STATUS_CONFIG[statut || ""] || { label: statut || "Inconnu", variant: "secondary" as const, color: "bg-gray-500" };
  const priorityConf = PRIORITY_CONFIG[priorite || ""];

  return (
    <div className="flex flex-wrap gap-2 items-center px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-xs text-muted-foreground font-mono">{ticketId}</span>

      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusConf.color} text-white`}>
        {statusConf.label}
      </span>

      {priorityConf && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${priorityConf.color}`}>
          {priorityConf.label}
        </span>
      )}

      {categorie && (
        <Badge variant="outline" className="text-xs capitalize">
          {categorie.replace(/_/g, " ")}
        </Badge>
      )}

      {confiance !== null && (
        <span className="text-xs text-muted-foreground">
          Confiance: {Math.round(confiance * 100)}%
        </span>
      )}

      {validationHumaineRequise && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">
        </span>
      )}
    </div>
  );
}
