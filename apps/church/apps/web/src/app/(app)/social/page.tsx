import { createServerClient } from "@/lib/supabase/server";
import { MuralClient } from "@/features/social/components/mural-client";

export const metadata = { title: "Mural — Kairos" };

export default async function SocialPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canPost = ["church_admin", "pastor", "leader", "super_admin"].includes(profile?.role ?? "");

  return (
    <MuralClient
      currentUserId={user!.id}
      canPost={canPost}
    />
  );
}
