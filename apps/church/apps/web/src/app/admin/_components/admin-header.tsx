"use client";

import { ShieldCheck, LogOut } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MemberAvatar } from "@/features/members/components/member-avatar";

export function AdminHeader({ user }: { user: { name: string; avatar_url?: string | null } }) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-yellow-500">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-sm font-semibold">Painel Super Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <MemberAvatar name={user.name} avatarUrl={user.avatar_url} size="sm" />
        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
        <button
          onClick={() => void handleLogout()}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
