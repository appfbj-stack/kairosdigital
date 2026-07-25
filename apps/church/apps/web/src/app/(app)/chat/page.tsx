import { createServerClient } from "@/lib/supabase/server";
import { ChatClient } from "./chat-client";

export const metadata = { title: "Chat — Kairos" };

export default async function ChatPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, church_id")
    .eq("id", user.id)
    .single();

  const church_id = profile?.church_id;

  const churchData = church_id
    ? (await supabase.from("churches").select("name").eq("id", church_id).single()).data
    : null;

  // Cria sala padrão "geral" se não existir nenhuma
  if (church_id) {
    const { data: existing } = await supabase
      .from("k_rooms").select("id").eq("church_id", church_id).limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("k_rooms").insert({
        name: "geral",
        type: "general",
        church_id,
        created_by: user.id,
      });
    }
  }

  return (
    <ChatClient
      currentUserId={user.id}
      churchName={churchData?.name ?? "Kairos"}
      userName={profile?.name ?? ""}
      userRole={profile?.role ?? "member"}
    />
  );
}
