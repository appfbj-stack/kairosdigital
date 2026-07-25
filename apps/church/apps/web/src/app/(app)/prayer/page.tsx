import { createServerClient } from "@/lib/supabase/server";
import { PrayerClient } from "./prayer-client";

export default async function PrayerPage() {
  const supabase = await createServerClient();
  const { data: requests } = await supabase
    .from("prayer_requests")
    .select("*, requester:users!created_by(name, avatar_url)")
    .order("created_at", { ascending: false });

  return <PrayerClient requests={requests ?? []} />;
}
