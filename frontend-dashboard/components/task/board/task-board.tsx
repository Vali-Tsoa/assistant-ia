'use client';

import { useTasksStore, Task } from '@/store/tasks-store';
import { statuses } from '@/mock-data/statuses';
import { TaskColumn } from './task-column';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { TaskDetailSheet } from './task-detail-sheet';
import { Loader2, RefreshCw } from 'lucide-react';

export function TaskBoard() {
   const { tasksByStatus, updateTaskStatus, fetchTasks, fetchTaskWithHistory, isLoading, error } = useTasksStore();
   
   const [mounted, setMounted] = useState(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   useEffect(() => {
     setMounted(true);
     fetchTasks();
     // Auto-refresh toutes les 30 secondes pour voir les nouveaux tickets
     const interval = setInterval(fetchTasks, 30000);
     return () => clearInterval(interval);
   }, []);

   const handleTaskClick = async (task: Task) => {
     setSelectedTask(task);
     // Charger l'historique réel depuis le backend
     await fetchTaskWithHistory(task.id);
     // Mettre à jour la task sélectionnée avec les nouvelles données
     setSelectedTask(useTasksStore.getState().tasks.find(t => t.id === task.id) || task);
   };

   const onDragEnd = (result: DropResult) => {
     if (!result.destination) return;
     const taskId = result.draggableId;
     const newStatusId = result.destination.droppableId;
     const currentStatusId = result.source.droppableId;
     if (newStatusId !== currentStatusId) {
       const newStatus = statuses.find(s => s.id === newStatusId);
       if (newStatus) updateTaskStatus(taskId, newStatus);
     }
   };

   if (!mounted) {
     return <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden" />;
   }

   // État de chargement initial
   const totalTasks = Object.values(tasksByStatus).flat().length;
   if (isLoading && totalTasks === 0) {
     return (
       <div className="flex h-full items-center justify-center">
         <div className="flex flex-col items-center gap-3 text-muted-foreground">
           <Loader2 className="size-8 animate-spin text-primary" />
           <p className="text-sm">Chargement des tickets depuis la base de données...</p>
         </div>
       </div>
     );
   }

   // État vide (aucun ticket en BDD)
   if (!isLoading && totalTasks === 0 && !error) {
     return (
       <div className="flex h-full items-center justify-center">
         <div className="flex flex-col items-center gap-3 text-center text-muted-foreground max-w-sm">
           <div className="size-16 rounded-full bg-muted flex items-center justify-center">
             <RefreshCw className="size-7" />
           </div>
           <h3 className="font-semibold text-foreground">Aucun ticket pour le moment</h3>
           <p className="text-sm">
             Les tickets générés par les utilisateurs via l'interface client apparaîtront ici automatiquement.
           </p>
         </div>
       </div>
     );
   }

   return (
     <>
       {isLoading && totalTasks > 0 && (
         <div className="absolute top-2 right-4 flex items-center gap-1 text-xs text-muted-foreground z-10">
           <Loader2 className="size-3 animate-spin" /> Mise à jour...
         </div>
       )}

       {error && (
         <div className="absolute top-2 right-4 text-xs text-red-500 z-10">
           ⚠️ {error}
         </div>
       )}

       <DragDropContext onDragEnd={onDragEnd}>
         <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden">
           {statuses.map((status) => (
             <TaskColumn
               key={status.id}
               status={status}
               tasks={tasksByStatus[status.id] || []}
               onTaskClick={handleTaskClick}
             />
           ))}
         </div>
       </DragDropContext>

       <TaskDetailSheet
         task={selectedTask}
         open={!!selectedTask}
         onOpenChange={(open) => !open && setSelectedTask(null)}
       />
     </>
   );
}
