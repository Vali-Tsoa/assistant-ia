'use client';

import { useTasksStore } from '@/store/tasks-store';

import { statuses } from '@/mock-data/statuses';
import { TaskColumn } from './task-column';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { Task } from '@/mock-data/tasks';
import { TaskDetailSheet } from './task-detail-sheet';

export function TaskBoard() {
   const { tasksByStatus, updateTaskStatus } = useTasksStore();
   
   // Handle hydration mismatch with dnd
   const [mounted, setMounted] = useState(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   useEffect(() => {
     setMounted(true);
   }, []);

   const onDragEnd = (result: DropResult) => {
     if (!result.destination) return;
     
     const taskId = result.draggableId;
     const newStatusId = result.destination.droppableId;
     const currentStatusId = result.source.droppableId;
     
     if (newStatusId !== currentStatusId) {
       const newStatus = statuses.find(s => s.id === newStatusId);
       if (newStatus) {
         updateTaskStatus(taskId, newStatus);
       }
     }
   };

   if (!mounted) {
     return <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden" />;
   }

   return (
     <>
       <DragDropContext onDragEnd={onDragEnd}>
         <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden">
           {statuses.map((status) => (
             <TaskColumn
               key={status.id}
               status={status}
               tasks={tasksByStatus[status.id] || []}
               onTaskClick={setSelectedTask}
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

