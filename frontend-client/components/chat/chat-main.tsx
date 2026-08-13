"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Send, RotateCcw, BrainCircuit, User, Loader2, AlertTriangle, CheckCircle, ArrowUpRight, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { updateTicket } from "@/lib/api";

const PRIORITY_STYLES: Record<string, { label: string; class: string }> = {
  P1_critique: { label: "🚨 P1 Critique", class: "bg-red-500/10 text-red-600 border-red-500/20" },
  P2_haute: { label: "🔴 P2 Haute", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  P3_moyenne: { label: "🟡 P3 Moyenne", class: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  P4_basse: { label: "🟢 P4 Basse", class: "bg-green-500/10 text-green-700 border-green-500/20" },
};

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  EN_COURS: { label: "En cours", class: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  EN_ATTENTE_UTILISATEUR: { label: "En attente", class: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  RESOLU: { label: "✅ Résolu", class: "bg-green-500/10 text-green-700 border-green-500/20" },
  ESCALADE: { label: "⬆ Escaladé", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
};

export function ChatMain() {
  const { sendMessage, isLoading } = useChat();
  const { messages, ticket, reset, setTicket } = useChatStore();
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Polling — Synchronisation du statut depuis le backend ────────────────
  // Si un technicien change le statut dans le dashboard, le chat se met à jour
  const syncTicketStatus = useCallback(async () => {
    if (!ticket.id) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/tickets/${ticket.id}`);
      if (!res.ok) return;
      const data = await res.json();
      // Mettre à jour uniquement si le statut a changé
      if (data.statut && data.statut !== ticket.statut) {
        setTicket({ statut: data.statut });
      }
    } catch {
      // Silencieux — ne pas bloquer si le réseau est indisponible
    } finally {
      setIsSyncing(false);
    }
  }, [ticket.id, ticket.statut]);

  useEffect(() => {
    if (!ticket.id) return;
    // Synchronisation initiale
    syncTicketStatus();
    // Polling toutes les 15 secondes
    const interval = setInterval(syncTicketStatus, 15000);
    return () => clearInterval(interval);
  }, [ticket.id, syncTicketStatus]);

  if (!mounted) {
    return null;
  }

  const isConversationStarted = messages.length > 0;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Écran de bienvenue ────────────────────────────────────────────────────────
  if (!isConversationStarted) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-[640px] space-y-8 -mt-12">
          <div className="flex justify-center">
            <Image
              src="/ispm.png"
              alt="ISPM Logo"
              width={80}
              height={80}
              className="size-20 object-contain rounded"
            />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">mAIntenance </h1>
            <p className="text-lg text-muted-foreground">
              Votre assistant IA de support informatique — Décrivez votre problème
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary p-1">
            <div className="rounded-xl border border-border bg-card">
              <Textarea
                placeholder="Ex : Mon Wi-Fi ne fonctionne plus depuis ce matin..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] resize-none border-0 bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />
              <div className="flex items-center justify-end px-4 py-3 border-t border-border/50">
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Envoyer
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              "Mon Wi-Fi ne fonctionne plus",
              "Je n'arrive pas à me connecter à ma messagerie",
              "Mon ordinateur est très lent",
              "J'ai oublié mon mot de passe Windows",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-left rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6">
          <p className="text-xs text-muted-foreground">
            mAIntenance  — Propulsé par Gemini {" "}
            <span className="font-mono">gemini-3.1-flash-lite</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Vue conversation ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Ticket Status Bar */}
      {ticket.id && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/40 text-sm flex-wrap">
          <span className="font-mono font-semibold text-primary">{ticket.id}</span>
          {ticket.statut && STATUS_STYLES[ticket.statut] && (
            <span className={cn("px-2 py-0.5 rounded border text-xs font-medium", STATUS_STYLES[ticket.statut].class)}>
              {STATUS_STYLES[ticket.statut].label}
            </span>
          )}
          {ticket.categorie && (
            <span className="text-muted-foreground">• {ticket.categorie?.replace(/_/g, " ")}</span>
          )}
          {typeof ticket.confiance === "number" && (
            <span className="text-muted-foreground ml-auto">Confiance IA : {Math.round(ticket.confiance * 100)}%</span>
          )}
          {/* Bouton actualisation manuelle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={syncTicketStatus}
            disabled={isSyncing}
            className="size-7 rounded-full border"
            title="Actualiser le statut"
          >
            <RefreshCw className={cn("size-3", isSyncing && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} className="size-7 rounded-full border" title="Nouveau ticket">
            <RotateCcw className="size-3" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-[700px] mx-auto space-y-6">
          {messages.map((msg) => {
            const isSecurityAlert =
              !msg.isLoading &&
              msg.role === "agent" &&
              msg.agentResponse?.decision?.action === "refus_securite";

            if (isSecurityAlert) {
              return (
                <div key={msg.id} className="my-2">
                  {/* ── Bannière alerte sécurité ── */}
                  <div className="relative overflow-hidden rounded-xl border-2 border-red-500/60 bg-red-500/10 shadow-lg shadow-red-500/10 animate-in slide-in-from-bottom-2">
                    {/* Bande rouge de gauche */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />

                    <div className="pl-5 pr-4 py-4">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="size-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                          <ShieldAlert className="size-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                            🚨 Alerte Sécurité — Demande Bloquée
                          </p>
                          <p className="text-[10px] text-red-600/70 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed">
                        {msg.content}
                      </p>

                      {/* Footer badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-700 dark:text-red-300">
                          <AlertTriangle className="size-3" />
                          Ticket escaladé — Validation humaine requise
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              {/* Avatar */}
              <div className={cn(
                "size-8 shrink-0 rounded-full flex items-center justify-center mt-1",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
              )}>
                {msg.role === "user"
                  ? <User className="size-4" />
                  : <BrainCircuit className="size-4 text-primary" />
                }
              </div>

              {/* Bulle */}
              <div className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                <span className="text-xs text-muted-foreground mb-1">
                  {msg.role === "user" ? "Vous" : "Agent IA (Gemini)"}
                </span>

                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted border border-border rounded-tl-none"
                )}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>L'agent analyse votre demande...</span>
                    </div>
                  ) : msg.content}
                </div>

                {/* Sources citées */}
                {msg.agentResponse?.execution?.sources_consultees?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.agentResponse.execution.sources_consultees.map((src: string) => (
                      <span key={src} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-primary font-mono">
                        <ArrowUpRight className="size-3" /> {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action de l'agent */}
                {msg.agentResponse?.decision?.action && (
                  <div className="mt-1">
                    {msg.agentResponse.decision.action === "escalade_technicien" && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <AlertTriangle className="size-3" /> Ticket escaladé à un technicien
                      </span>
                    )}
                    {msg.agentResponse.decision.action === "resolution_automatique" && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle className="size-3" /> Ticket résolu automatiquement
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 md:px-8 py-4">
        <div className="max-w-[700px] mx-auto">
          <div className="rounded-2xl border border-border bg-secondary p-1">
            <div className="rounded-xl border border-border bg-card">
              <Textarea
                placeholder="Répondre à l'agent... (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="min-h-[80px] resize-none border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />
              <div className="flex items-center justify-end px-4 py-3 border-t border-border/50">
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="sm" className="gap-2 h-7 px-4">
                  {isLoading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
