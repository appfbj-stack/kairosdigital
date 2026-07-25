import { createServerClient } from "@/lib/supabase/server";
import { MinistriesClient } from "./ministries-client";

export default async function MinistriesPage() {
  const supabase = await createServerClient();
  const { data: ministries } = await supabase
    .from("ministries")
    .select("*, leader:users(name)")
    .order("name");

  return <MinistriesClient ministries={ministries ?? []} />;
}
