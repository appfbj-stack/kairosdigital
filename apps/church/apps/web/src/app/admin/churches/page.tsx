import { createServiceClient } from "@/lib/supabase/server";
import { ChurchesClient } from "./churches-client";

export default async function AdminChurchesPage() {
  const supabase = await createServiceClient();

  // Para cada igreja, buscar contagem de membros
  const { data: churches } = await supabase
    .from("churches")
    .select("id, name, plan, created_at")
    .order("created_at", { ascending: false });

  // Buscar contagens por igreja
  const churchIds = (churches ?? []).map((c) => c.id);
  const memberCounts: Record<string, number> = {};
  const userCounts: Record<string, number> = {};

  if (churchIds.length) {
    const { data: members } = await supabase
      .from("members")
      .select("church_id");
    const { data: users } = await supabase
      .from("users")
      .select("church_id");

    (members ?? []).forEach((m: { church_id: string }) => {
      memberCounts[m.church_id] = (memberCounts[m.church_id] ?? 0) + 1;
    });
    (users ?? []).forEach((u: { church_id: string }) => {
      userCounts[u.church_id] = (userCounts[u.church_id] ?? 0) + 1;
    });
  }

  const churchesWithStats = (churches ?? []).map((c) => ({
    ...c,
    memberCount: memberCounts[c.id] ?? 0,
    userCount: userCounts[c.id] ?? 0,
  }));

  return <ChurchesClient churches={churchesWithStats} />;
}
