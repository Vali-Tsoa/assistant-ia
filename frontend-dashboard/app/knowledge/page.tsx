"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskSidebar } from "@/components/task/sidebar/task-sidebar";
import { TaskHeader } from "@/components/task/header/task-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  BookOpen, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileEdit,
  Binary
} from "lucide-react";
import { 
  fetchKBDocuments, 
  saveKBDocument, 
  deleteKBDocument, 
  KBDocument 
} from "@/lib/api";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);
  
  // Form states
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false); // False means creating new
  
  // Loading & status states
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async (selectFilename?: string) => {
    setIsLoadingList(true);
    try {
      const data = await fetchKBDocuments();
      setDocuments(data);
      if (data.length > 0) {
        // If selectFilename specified, find it, otherwise select the first one
        const docToSelect = selectFilename 
          ? data.find(d => d.filename === selectFilename) || data[0]
          : data[0];
        
        handleSelectDoc(docToSelect);
      } else {
        handleNewDoc();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Impossible de charger la base de connaissance. Vérifiez que le serveur backend est démarré.",
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSelectDoc = (doc: KBDocument) => {
    setSelectedDoc(doc);
    setFilename(doc.filename);
    setContent(doc.content);
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleNewDoc = () => {
    setSelectedDoc(null);
    setFilename("KB-NEW-DOC.md");
    setContent(`# KB-NEW-DOC — Titre de la procédure\n\n**Catégorie** : Support Technique  \n**Version** : 1.0  \n\n---\n\n## Problèmes Couverts\n\n- Description courte des pannes\n\n---\n\n## Procédure de Résolution\n\n1. Étape 1\n2. Étape 2\n`);
    setIsEditing(false);
    setStatusMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      setStatusMessage({ type: "error", text: "Le nom du fichier ne peut pas être vide." });
      return;
    }
    if (!content.trim()) {
      setStatusMessage({ type: "error", text: "Le contenu ne peut pas être vide." });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: "info", text: "Sauvegarde et indexation vectorielle en cours..." });

    try {
      const result = await saveKBDocument(filename, content);
      if (result.success) {
        setStatusMessage({
          type: "success",
          text: `Document sauvegardé avec succès. ${result.chunks_indexed} sections indexées dans ChromaDB RAG.`,
        });
        // Reload list and keep current selected
        await loadDocs(filename);
      } else {
        setStatusMessage({ type: "error", text: result.message || "Erreur de sauvegarde." });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Erreur lors de la communication avec le backend.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    if (!confirm(`Voulez-vous vraiment supprimer le document ${selectedDoc.filename} ?`)) return;

    setIsDeleting(true);
    setStatusMessage({ type: "info", text: "Suppression et mise à jour de l'index..." });

    try {
      const result = await deleteKBDocument(selectedDoc.filename);
      if (result.success) {
        setStatusMessage({
          type: "success",
          text: `Document supprimé. Index RAG mis à jour (${result.chunks_indexed} sections restantes).`,
        });
        await loadDocs();
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Erreur lors de la suppression.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <TaskSidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-screen bg-background">
        <TaskHeader />
        
        <main className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Base de Connaissance RAG
              </h1>
              <p className="text-sm text-muted-foreground">
                Gérez les procédures d'assistance lues en temps réel par l'agent IA.
              </p>
            </div>
            <Button size="sm" onClick={handleNewDoc} className="gap-2">
              <Plus className="size-4" />
              Nouveau document
            </Button>
          </div>

          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Left sidebar: File list */}
            <div className="md:col-span-1 border rounded-xl bg-card flex flex-col overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-muted/30 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fichiers Markdown (.md)
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-7" 
                  onClick={() => loadDocs(selectedDoc?.filename)}
                  disabled={isLoadingList}
                >
                  <RefreshCw className={`size-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.filename === doc.filename;
                  return (
                    <button
                      key={doc.filename}
                      onClick={() => handleSelectDoc(doc)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <FileText className={`size-4 mt-0.5 shrink-0 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className={`text-[10px] truncate ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {(doc.size / 1024).toFixed(1)} KB • RAG
                        </p>
                      </div>
                    </button>
                  );
                })}

                {documents.length === 0 && !isLoadingList && (
                  <p className="text-xs text-center text-muted-foreground p-8">
                    Aucun document trouvé. Cliquez sur "Nouveau document" pour commencer.
                  </p>
                )}
              </div>
            </div>

            {/* Right area: Saisie libre Editor */}
            <div className="md:col-span-3 border rounded-xl bg-card flex flex-col overflow-hidden">
              <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/30 shrink-0">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <FileEdit className="size-4 text-muted-foreground shrink-0" />
                    <Input
                      type="text"
                      placeholder="KB-NET-01.md"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="font-mono text-sm h-8 bg-background border-muted"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="gap-2"
                      >
                        <Trash2 className="size-4" />
                        Supprimer
                      </Button>
                    )}
                    <Button type="submit" size="sm" disabled={isSaving || isDeleting} className="gap-2">
                      {isSaving ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Enregistrer & Indexer
                    </Button>
                  </div>
                </div>

                {/* Status alert message */}
                {statusMessage && (
                  <div className={`px-4 py-2 border-b flex items-center gap-2 text-xs font-medium shrink-0 ${
                    statusMessage.type === "success" 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                      : statusMessage.type === "error"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  }`}>
                    {statusMessage.type === "success" && <CheckCircle2 className="size-4 shrink-0 text-green-500" />}
                    {statusMessage.type === "error" && <AlertCircle className="size-4 shrink-0 text-destructive" />}
                    {statusMessage.type === "info" && <RefreshCw className="size-4 shrink-0 animate-spin text-blue-500" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* Editor Content Area (Saisie Libre) */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Contenu de la procédure (Format Markdown)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {content.length} caractères
                    </span>
                  </div>
                  <textarea
                    placeholder="# Procédure d'installation..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 min-h-[300px] font-mono leading-relaxed resize-none"
                    required
                  />
                </div>

                {/* Footer instructions */}
                <div className="px-4 py-3 border-t bg-muted/10 flex items-center justify-between text-xs text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Binary className="size-3.5 text-primary" />
                    <span>L'enregistrement lance la vectorisation ChromaDB pour le RAG.</span>
                  </div>
                  <span>Supporte les titres, tableaux et blocs de code standard Markdown.</span>
                </div>
              </form>
            </div>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
