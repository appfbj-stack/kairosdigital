import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@kairos/types";
import { createLocalSupabase } from "../../../../../db/local-supabase";

export async function createServerClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_LOCAL === "true") {
    return createLocalSupabase() as unknown as Awaited<ReturnType<typeof createSupabaseServerClient<Database>>>;
  }
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function createServiceClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_LOCAL === "true") {
    return createLocalSupabase() as unknown as Awaited<ReturnType<typeof createSupabaseServerClient<Database>>>;
  }
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}
