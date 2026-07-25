"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CircleDot,
  MessageSquare,
  DollarSign,
  HeartHandshake,
  Calendar,
  Church,
  Settings,
  ChevronLeft,
  Mic2,
  Building,
  Sparkles,
  HandHeart,
  Newspaper,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/members", icon: Users, label: "Membros" },
  { href: "/cells", icon: CircleDot, label: "Células" },
  { href: "/congregations", icon: Building, label: "Congreg." },
  { href: "/ministries", icon: Church, label: "Ministérios" },
  { href: "/events", icon: Calendar, label: "Eventos" },
  { href: "/finance", icon: DollarSign, label: "Finanças" },
  { href: "/prayer", icon: HeartHandshake, label: "Oração" },
  { href: "/sermons", icon: Mic2, label: "Sermões" },
  { href: "/volunteers", icon: HandHeart, label: "Voluntários" },
  { href: "/social", icon: Newspaper, label: "Mural" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/ai", icon: Sparkles, label: "Kairos AI" },
  { href: "/planos", icon: CreditCard, label: "Planos" },
];

export function AppSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = role === "super_admin";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">K</div>
            <span className="text-lg font-bold">Kairos</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {mainNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2 space-y-0.5 shrink-0">
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Super Admin</span>}
          </Link>
        )}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>
      </div>
    </aside>
  );
}
