import { createServerClient } from "@/lib/supabase/server";
import { SermonsClient } from "./sermons-client";

export default async function SermonsPage() {
  const supabase = await createServerClient();
  const { data: sermons } = await supabase
    .from("sermons")
    .select("*, pastor:users!pastor_id(name, avatar_url)")
    .order("preached_at", { ascending: false });

  return <SermonsClient sermons={sermons ?? []} />;
}
