"use client";

import { useState } from "react";
import {
  SearchIcon,
  HomeIcon,
  SparklesIcon,
  FileStackIcon,
  Layers3Icon,
  FolderClosedIcon,
  ZapIcon,
  MessageCircleDashedIcon,
  WandSparklesIcon,
  BoxIcon,
  ChevronDownIcon,
  UsersIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  CheckIcon,
  MoreVerticalIcon,
  Share2Icon,
  PencilIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const iconMap = {
  zap: ZapIcon,
  "message-circle-dashed": MessageCircleDashedIcon,
  "wand-sparkles": WandSparklesIcon,
  box: BoxIcon,
};

const teams = [
  { id: "personal", name: "Utilisateur", icon: UsersIcon }
]

export function ChatSidebar() {
  const {
    chats,
    selectedChatId,
    selectChat,
    archiveChat,
    unarchiveChat,
    deleteChat,
  } = useChatStore();
  const [selectedTeam, setSelectedTeam] = useState("personal");

  const recentChats = chats.filter((chat) => !chat.isArchived);
  const archivedChats = chats.filter((chat) => chat.isArchived);

  return (
    <div className="flex h-full w-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2.5 px-2 h-10"
            >
              <div className="ml-auto flex items-center gap-1.5">
                <Image
                  src="/ln.png"
                  alt="lndev.me"
                  className="size-5 object-cover rounded-full"
                  width={20}
                  height={20}
                />
                <ChevronDownIcon className="size-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {teams.map((team) => {
              const TeamIcon = team.icon;
              const isSelected = selectedTeam === team.id;
              return (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className="gap-2"
                >
                  <TeamIcon className="size-4" />
                  <span className="flex-1">{team.name}</span>
                  
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Image
                src="/ln.png"
                alt="lndev.me"
                className="size-4 object-cover rounded-full"
                width={16}
                height={16}
              />
              <span>utilisateur@gmail.com</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-3">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9 pr-10 h-[34px] bg-muted/50 italic"
          />
          <div className="absolute right-2 flex items-center justify-center size-5 rounded bg-muted text-xs text-muted-foreground">
            /
          </div>
        </div>
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-3 space-y-4">
          <div className="space-y-1">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Récentes
              </p>
            </div>
            {recentChats.map((chat) => {
              const Icon =
                iconMap[chat.icon as keyof typeof iconMap] ||
                MessageCircleDashedIcon;
              const isActive = selectedChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group/item relative flex items-center rounded-md overflow-hidden",
                    isActive && "bg-sidebar-accent"
                  )}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 justify-start gap-2 px-2 text-left h-auto py-1.5 min-w-0 pr-8",
                      isActive ? "hover:bg-sidebar-accent" : "hover:bg-accent"
                    )}
                    onClick={() => selectChat(chat.id)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm truncate min-w-0">
                      {chat.title}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        className="absolute right-1 size-7 opacity-0 group-hover/item:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                      >
                        <MoreVerticalIcon className="size-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48"
                      side="right"
                      align="start"
                    >
                      <DropdownMenuItem>
                        <Share2Icon className="size-4 text-muted-foreground" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilIcon className="size-4 text-muted-foreground" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveChat(chat.id)}>
                        <ArchiveIcon className="size-4 text-muted-foreground" />
                        <span>Archive</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteChat(chat.id)}
                      >
                        <Trash2Icon className="size-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>

          <div className="space-y-1">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Archives
              </p>
            </div>
            {archivedChats.map((chat) => {
              const Icon =
                iconMap[chat.icon as keyof typeof iconMap] ||
                MessageCircleDashedIcon;
              const isActive = selectedChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group/item relative flex items-center rounded-md overflow-hidden",
                    isActive && "bg-sidebar-accent"
                  )}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 justify-start gap-2 px-2 text-left h-auto py-1.5 min-w-0 pr-8",
                      isActive ? "hover:bg-sidebar-accent" : "hover:bg-accent"
                    )}
                    onClick={() => selectChat(chat.id)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm truncate min-w-0">
                      {chat.title}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        className="absolute right-1 size-7 opacity-0 group-hover/item:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                      >
                        <MoreVerticalIcon className="size-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48"
                      side="right"
                      align="start"
                    >
                      <DropdownMenuItem>
                        <Share2Icon className="size-4 text-muted-foreground" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilIcon className="size-4 text-muted-foreground" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => unarchiveChat(chat.id)}>
                        <ArchiveRestoreIcon className="size-4 text-muted-foreground" />
                        <span>Unarchive</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteChat(chat.id)}
                      >
                        <Trash2Icon className="size-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
