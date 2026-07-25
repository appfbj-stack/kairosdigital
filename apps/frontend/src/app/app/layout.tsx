"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app/chat",        label: "Chat IA",       icon: "💬" },
  { href: "/app/contacts",    label: "Contatos",      icon: "👥" },
  { href: "/app/pipeline",    label: "Pipeline",      icon: "📊" },
  { href: "/app/tasks",       label: "Tarefas",       icon: "✅" },
  { href: "/app/calendar",    label: "Agenda",        icon: "📅" },
  { href: "/app/whatsapp",    label: "WhatsApp",      icon: "📱" },
  { href: "/app/automations", label: "Automações",    icon: "⚡" },
  { href: "/app/settings",    label: "Configurações", icon: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0B0B0B]">
      {/* Sidebar — estilo templo imperial */}
      <aside className="hidden w-64 flex-col border-r border-[#D4AF37]/15 bg-[#0D0D0D] md:flex">
        {/* Logo */}
        <Link
          href="/app/chat"
          className="flex items-center gap-3 border-b border-[#D4AF37]/15 px-5 py-5 transition hover:bg-[#D4AF37]/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#141414] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <span className="text-base font-bold text-[#D4AF37]">H</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F5F5F2]">Hermes OS</p>
            <p className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Tecnologia dos Deuses</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#D4AF37]/15 px-5 py-3">
          <p className="text-[10px] uppercase tracking-widest text-[#555]">v0.1.0 · Hermes OS</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
        isActive
          ? "border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.1)]"
          : "text-[#8A8A8A] hover:bg-[#D4AF37]/5 hover:text-[#F5F5F2]"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
      )}
    </Link>
  );
}
