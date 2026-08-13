/**
 * SourcesCitees — Affiche les sources RAG citées par l'agent
 */
"use client";

import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SourcesCiteesProps {
  sources: string[];
  outils?: Array<{ outil: string; parametres: Record<string, unknown>; resultat: string }>;
}

export function SourcesCitees({ sources, outils }: SourcesCiteesProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0 && (!outils || outils.length === 0)) return null;

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        <span>
          {sources.length > 0 && `${sources.length} source(s) consultée(s)`}
          {outils && outils.length > 0 && ` · ${outils.length} outil(s) appelé(s)`}
        </span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-border/50">
          {sources.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">📚 Sources documentaires :</p>
              {sources.map((src, i) => (
                <span
                  key={i}
                  className="inline-flex items-center mr-2 mb-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono"
                >
                  {src}
                </span>
              ))}
            </div>
          )}

          {outils && outils.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">⚙️ Outils exécutés :</p>
              {outils.map((outil, i) => (
                <div key={i} className="mb-1 p-1.5 rounded bg-muted/50 font-mono">
                  <span className="text-purple-600 dark:text-purple-400">{outil.outil}</span>
                  <span className="text-muted-foreground"> → {outil.resultat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
