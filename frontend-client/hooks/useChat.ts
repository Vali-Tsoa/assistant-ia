/**
 * Hook principal du chat — Gère l'envoi de messages et la réception des réponses.
 */
"use client";

import { useCallback } from "react";
import { sendChatMessage } from "@/lib/api";
import { useChatStore } from "@/store/chatStore";

export function useChat() {
  const { addMessage, updateMessage, setTicket, setLoading, isLoading, userId, ticket } =
    useChatStore();

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      // 1. Ajouter le message utilisateur immédiatement
      addMessage({ role: "user", content: message });

      // 2. Ajouter un message "loading" temporaire
      const loadingId = addMessage({
        role: "agent",
        content: "",
        isLoading: true,
      });

      setLoading(true);

      try {
        // 3. Appel API backend
        const response = await sendChatMessage({
          message,
          user_id: userId,
          ticket_id: ticket.id || undefined,
        });

        // 4. Mettre à jour le ticket dans le store
        setTicket({
          id: response.meta.ticket_id,
          statut: response.decision.statut_ticket,
          priorite: response.classification.priorite,
          categorie: response.classification.categorie,
          confiance: response.classification.confiance,
          validationHumaineRequise: response.decision.validation_humaine_requise,
        });

        // 5. Remplacer le message loading par la vraie réponse
        updateMessage(loadingId, {
          content: response.reponse_client,
          isLoading: false,
          agentResponse: response,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Erreur de connexion au serveur.";
        updateMessage(loadingId, {
          content: `⚠️ ${errorMsg}`,
          isLoading: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, updateMessage, setTicket, setLoading, isLoading, userId, ticket.id]
  );

  return { sendMessage, isLoading };
}
