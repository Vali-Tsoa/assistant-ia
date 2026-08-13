"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Link as LinkIcon,
  RefreshCw,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { TaskFilters } from "./task-filters";
import { TaskSort } from "./task-sort";
import { TaskAutomate } from "./task-automate";
import { TaskImportExport } from "./task-import-export";
import { useTasksStore } from "@/store/tasks-store";
import { cn } from "@/lib/utils";

export function TaskHeader() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    new Date("2024-09-07")
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { fetchTasks, isLoading, lastFetch } = useTasksStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Réinitialiser le throttle pour forcer le rechargement
    useTasksStore.setState({ lastFetch: 0 });
    await fetchTasks();
    setIsRefreshing(false);
  };

  const lastUpdateText = React.useMemo(() => {
    if (!lastFetch) return "Jamais actualisé";
    const diff = Math.round((Date.now() - lastFetch) / 1000);
    if (diff < 10) return "À l'instant";
    if (diff < 60) return `Il y a ${diff}s`;
    return `Il y a ${Math.round(diff / 60)}min`;
  }, [lastFetch, isRefreshing]);
  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-3 lg:px-6 py-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-semibold">Dashboard ISPM</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <ThemeToggle />
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{lastUpdateText}</span>
            <div className="flex -space-x-2">
              <Avatar className="size-5 border-2 border-background">
                <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=AliceJohnson" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="size-5 border-2 border-background">
                <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=BobSmith" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar className="size-5 border-2 border-background">
                <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=CharlieBrown" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-none"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Actualiser les tickets"
          >
            <RefreshCw className={cn("size-4", (isRefreshing || isLoading) && "animate-spin")} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 hidden lg:flex"
          >
            <LinkIcon className="size-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-t border-border overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <TaskFilters />
          <TaskSort />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden lg:flex font-normal"
              >
                <CalendarIcon className="size-4" />
                {date
                  ? date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(selectedDate: Date | undefined) => {
                  setDate(selectedDate);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <TaskImportExport />
          <Button size="sm" className="sm:gap-2 shrink-0">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nouveau ticket</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

