import { createServerClient } from "@/lib/supabase/server";
import { MembersClient } from "./members-client";

export const metadata = { title: "Membros — Kairos" };

export default async function MembersPage() {
  const supabase = await createServerClient();

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("name");

  return <MembersClient members={members ?? []} />;
}
