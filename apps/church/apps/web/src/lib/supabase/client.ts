import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { Database } from "@kairos/types";
import { createLocalSupabase } from "../../../../../db/local-supabase";

export function createBrowserClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_LOCAL === "true") {
    return createLocalSupabase() as unknown as ReturnType<typeof createSupabaseBrowserClient<Database>>;
  }
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
