"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Church, Users, Settings, ArrowLeft, ShieldCheck, BarChart3, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/admin/churches", icon: Church, label: "Igrejas" },
  { href: "/admin/users", icon: Users, label: "Usuários" },
  { href: "/admin/plans", icon: CreditCard, label: "Planos" },
  { href: "/admin/stats", icon: BarChart3, label: "Estatísticas" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 h-full bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-lg bg-yellow-500 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold block leading-none">Super Admin</span>
          <span className="text-xs text-muted-foreground">Kairos Platform</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-yellow-500 text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Voltar ao App</span>
        </Link>
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/admin/settings"
              ? "bg-yellow-500 text-white"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
