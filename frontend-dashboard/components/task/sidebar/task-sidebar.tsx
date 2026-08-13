"use client";

import {
  Bell,
  LayoutGrid,
  Circle,
  Star,
  FileCheck,
  FileText,
  Calendar,
  Users,
  Building,
  ChevronDown,
  Paperclip,
  Folder,
  Mail,
  HelpCircle,
  ArrowUpRight,
  Layers,
  CreditCard,
  Navigation,
  Search,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Kbd } from "@/components/ui/kbd";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}

function SidebarItem({ icon, label, badge, active }: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-between px-3 py-2 h-auto text-sm",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </Button>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        className="gap-2 px-1 mb-2 text-xs h-auto py-0 text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown className="size-3" />
      </Button>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function TaskSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto p-0! hover:bg-transparent"
                >
                  <div className="size-6 bg-linear-to-br from-blue-500 to-cyan-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                    IS
                  </div>
                  <span className="font-semibold">mAIntenance ISPM</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      SU
                    </div>
                    <span className="font-semibold">Square UI</span>
                    <Check className="size-4 ml-auto" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-blue-500 to-cyan-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      CI
                    </div>
                    <span>Circle</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-orange-500 to-red-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      LN
                    </div>
                    <span>lndev-ui</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="size-4" />
                  <span>Add new team</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Image
              src="/ln.png"
              alt="lndev.me"
              className="size-5 object-cover rounded-full"
              width={20}
              height={20}
            />
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything"
              className="pl-8 pr-10 text-xs h-8 bg-background"
            />
            <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <div className="space-y-0.5 mb-6">
          <SidebarItem
            icon={<LayoutGrid className="size-4" />}
            label="Dashboard"
          />
          <SidebarItem icon={<Star className="size-4" />} label="Tickets" active />
          <SidebarItem
            icon={<Circle className="size-4" />}
            label="Assignés à moi"
          />
          <SidebarItem
            icon={<Bell className="size-4" />}
            label="Alertes Système"
            badge="3"
          />
        </div>

        <SidebarSection title="Équipes & Ressources">
          <SidebarItem icon={<Users className="size-4" />} label="Techniciens" />
          <SidebarItem icon={<Building className="size-4" />} label="Départements" />
          <SidebarItem icon={<FileText className="size-4" />} label="Base de Connaissance" />
        </SidebarSection>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-0.5">
        <Button
          variant="outline"
          className="w-full justify-between px-3 py-2 h-auto text-sm shadow-none"
          asChild
        >
          <Link href="#" target="_blank">
            <div className="flex items-center gap-3">
              <HelpCircle className="size-4" />
              <span>ispm.fr/intranet</span>
            </div>
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        <SidebarItem icon={<Layers className="size-4" />} label="Paramètres Agent IA" />
      </SidebarFooter>
    </Sidebar>
  );
}
