import { createServerClient } from "@/lib/supabase/server";
import { EventsClient } from "./events-client";

export default async function EventsPage() {
  const supabase = await createServerClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_at", { ascending: true });

  return <EventsClient events={events ?? []} />;
}
