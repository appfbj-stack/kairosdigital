import { createServerClient } from "@/lib/supabase/server";
import { AiClient } from "./ai-client";

export default async function AiPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name, role, church_id")
    .eq("id", user!.id)
    .single();

  const churchName = user?.user_metadata?.["church_name"] ?? "Minha Igreja";

  return (
    <AiClient
      churchName={churchName}
      userName={profile?.name ?? user?.email ?? "Usuário"}
      userRole={profile?.role ?? "member"}
    />
  );
}
