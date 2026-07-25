"use client";

import type { User } from "@supabase/supabase-js";
import { Bell, Search, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AppHeader({ user }: { user: User }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    toast.success("Até logo!");
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
            {user.user_metadata?.["avatar_url"] ? (
              <img src={user.user_metadata["avatar_url"] as string} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user.user_metadata?.["name"] as string)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none">
              {user.user_metadata?.["name"] ?? user.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
