import { Label } from "./labels";
import { Status } from "./statuses";
import { User } from "./users";

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

// Les données fictives ont été entièrement purgées. 
// Le dashboard récupère désormais uniquement les vrais tickets de la base SQLite via l'API.
export const tasks: Task[] = [];

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
