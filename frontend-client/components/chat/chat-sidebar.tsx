"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useChatStore } from "@/store/chatStore";
import { getTickets, getTicketHistory } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar() {
  const { userId, ticket: currentTicket, reset, loadConversation } = useChatStore();
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const tickets = await getTickets();
      // Filtrer les tickets pour cet utilisateur
      const userTickets = tickets.filter((t: any) => t.utilisateur_id === userId);
      setTicketsList(userTickets);
    } catch (e) {
      console.error("Erreur lors de la récupération de l'historique :", e);
    }
  }, [userId]);

  // Recharger l'historique lorsque le ticket courant change ou est créé
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, currentTicket.id, currentTicket.statut]);

  const handleSelectTicket = async (t: any) => {
    setLoadingHistory(true);
    try {
      const logs = await getTicketHistory(t.id);
      const mappedMessages = logs.map((log: any) => ({
        id: `msg-${log.id}`,
        role: log.auteur === "user" ? "user" : "agent",
        content: log.message,
        timestamp: log.horodatage,
      }));
      
      loadConversation(mappedMessages, {
        id: t.id,
        statut: t.statut,
        priorite: t.priorite,
        categorie: t.categorie,
        confiance: t.confiance_score,
        validationHumaineRequise: t.validation_humaine_requise,
      });
    } catch (err) {
      console.error("Erreur de chargement du ticket :", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* En-tête de l'application */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Image
          src="/ispm.png"
          alt="ISPM Logo"
          width={24}
          height={24}
          className="size-6 object-contain rounded"
        />
        <span className="font-bold text-sm bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          mAIntenance 
        </span>
      </div>

      {/* Bouton Nouveau Ticket */}
      <div className="p-3">
        <Button
          onClick={() => reset()}
          className="w-full justify-center gap-2 font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          variant="ghost"
        >
          <Plus className="size-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* Liste des Tickets Historiques */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Historique des tickets
        </p>
        
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : ticketsList.length === 0 ? (
          <div className="text-center py-6 px-2">
            <p className="text-xs text-muted-foreground italic">Aucun ticket précédent</p>
          </div>
        ) : (
          <div className="space-y-1">
            {ticketsList.map((t) => {
              const isActive = currentTicket.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex flex-col gap-1 border border-transparent",
                    isActive
                      ? "bg-secondary text-secondary-foreground border-border/50 shadow-xs"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold text-primary">{t.id}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(t.date_creation).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MessageSquare className="size-3.5 shrink-0 text-muted-foreground/75" />
                    <p className="text-xs font-medium line-clamp-1 break-all flex-1">{t.titre}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
