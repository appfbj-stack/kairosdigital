import { createServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("id, name, role, avatar_url, church_id")
    .eq("id", user!.id)
    .single();

  const { data: church } = await supabase
    .from("churches")
    .select("id, name, plan")
    .eq("id", profile?.church_id ?? "")
    .single();

  return (
    <SettingsClient
      profile={profile}
      church={church}
      email={user?.email ?? ""}
    />
  );
}
