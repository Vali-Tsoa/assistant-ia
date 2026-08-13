"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskSidebar } from "@/components/task/sidebar/task-sidebar";
import { TaskHeader } from "@/components/task/header/task-header";
import { TelemetryPanel } from "@/components/telemetry/telemetry-panel";

export default function TelemetryPage() {
  return (
    <SidebarProvider>
      <TaskSidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <TaskHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <TelemetryPanel />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
