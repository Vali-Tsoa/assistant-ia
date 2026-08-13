"use client";

import { Task } from "@/store/tasks-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { BrainCircuit, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] sm:max-w-2xl p-0 flex flex-col gap-0 border-l border-border bg-background">
        <SheetHeader className="p-6 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-2 mb-2">
            {task.labels.map((label) => (
              <Badge key={label.id} variant="secondary" className={cn("text-xs", label.color)}>
                {label.name}
              </Badge>
            ))}
          </div>
          <SheetTitle className="text-xl">{task.title}</SheetTitle>
          <SheetDescription className="text-sm mt-2">{task.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {task.evaluation && (
            <div className="p-6 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2 mb-4 font-semibold text-primary">
                <BrainCircuit className="size-5" />
                <h3>Analyse de l'Agent IA</h3>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diagnostic</span>
                    <p className="text-sm mt-1">{task.evaluation.diagnostic}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Justification de l'Urgence</span>
                    <p className="text-sm mt-1">{task.evaluation.urgencyReason}</p>
                  </div>
                  {task.evaluation.escalationReason && (
                    <div className="bg-orange-500/10 text-orange-700 dark:text-orange-400 p-2.5 rounded-md border border-orange-500/20 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="size-4" />
                        <span className="text-xs font-bold">Raison de l'escalade</span>
                      </div>
                      <p className="text-xs">{task.evaluation.escalationReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center justify-center bg-background rounded-lg p-3 border border-border shadow-sm min-w-[100px]">
                  <div className="size-16 mb-2">
                    <CircularProgressbar
                      value={task.evaluation.confidenceScore}
                      text={`${task.evaluation.confidenceScore}%`}
                      strokeWidth={10}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: task.evaluation.confidenceScore > 90 ? "#10b981" : task.evaluation.confidenceScore > 75 ? "#f59e0b" : "#ef4444",
                        textColor: 'currentColor',
                        trailColor: "transparent",
                      })}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground text-center">Indice de<br/>Confiance</span>
                </div>
              </div>
            </div>
          )}

          {task.conversation && task.conversation.length > 0 && (
            <div className="p-6 pb-12">
              <div className="flex items-center gap-2 mb-6 font-semibold">
                <MessageSquare className="size-5" />
                <h3>Historique de la conversation</h3>
              </div>
              
              <div className="space-y-4">
                {task.conversation.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
                      <Avatar className="size-8 shrink-0 mt-1">
                        {isUser ? (
                          <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=User123" />
                        ) : (
                          <AvatarImage src="https://api.dicebear.com/9.x/bottts/svg?seed=IA" />
                        )}
                        <AvatarFallback>{isUser ? "U" : "IA"}</AvatarFallback>
                      </Avatar>
                      
                      <div className={cn("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{isUser ? "Utilisateur" : "Agent IA"}</span>
                          <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm",
                          isUser 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none border border-border"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
