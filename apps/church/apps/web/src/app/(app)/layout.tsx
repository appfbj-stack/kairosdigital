import { createServerClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role, name, avatar_url, church_id")
    .eq("id", user?.id || "user-super")
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar role={profile?.role || "super_admin"} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader user={user || { email: "admin@novavida.com.br", user_metadata: { name: "Admin" } }} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
