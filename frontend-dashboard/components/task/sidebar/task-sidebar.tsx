"use client";

import {
  Activity,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Kbd } from "@/components/ui/kbd";
import { useAlertsStore } from "@/store/alerts-store";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  href?: string;
}

function SidebarItem({ icon, label, badge, active, href }: SidebarItemProps) {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-3 py-2 h-auto text-sm gap-3",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center animate-pulse">
            {badge}
          </div>
        )}
      </div>
    </Button>
  );

  if (href) {
    return (
      <Link href={href} className="w-full block">
        {content}
      </Link>
    );
  }

  return content;
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
  const { alerts, fetchAlerts, unresolvedCount } = useAlertsStore();
  const pathname = usePathname();

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const alertCount = unresolvedCount();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-3">
            <Image
              src="/ispm.png"
              alt="ISPM Logo"
              width={24}
              height={24}
              className="size-6 object-contain rounded"
            />
            <span className="font-bold text-sm bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent select-none">
              mAIntenance 
            </span>
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
            label="Dashboard / Kanban"
            href="/"
            active={pathname === "/"}
          />
          <SidebarItem
            icon={<Bell className="size-4" />}
            label="Alertes Système"
            href="/alerts"
            badge={alertCount > 0 ? String(alertCount) : undefined}
            active={pathname === "/alerts"}
          />
          <SidebarItem
            icon={<Activity className="size-4" />}
            label="Télémétrie IA"
            href="/telemetry"
            active={pathname === "/telemetry"}
          />
        </div>

        <SidebarSection title="Équipes & Ressources">
          <SidebarItem icon={<Users className="size-4" />} label="Techniciens" />
          <SidebarItem icon={<Building className="size-4" />} label="Départements" />
          <SidebarItem
            icon={<FileText className="size-4" />}
            label="Base de Connaissance"
            href="/knowledge"
            active={pathname === "/knowledge"}
          />
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
