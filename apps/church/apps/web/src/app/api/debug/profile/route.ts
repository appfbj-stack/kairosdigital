import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Não autenticado" });

  const { data: profile, error: profileError } = await supabase
    .from("users").select("id, church_id, name, role, email").eq("id", user.id).single();

  const { data: church } = profile?.church_id
    ? await supabase.from("churches").select("id, name, slug").eq("id", profile.church_id).single()
    : { data: null };

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
    profileError: profileError?.message ?? null,
    church: church ?? null,
    hasProfile: !!profile,
    hasChurchId: !!profile?.church_id,
    hasChurch: !!church,
  });
}

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const churchName = user.user_metadata?.["church_name"] as string ?? "Minha Igreja";
  const userName = user.user_metadata?.["name"] as string ?? user.email?.split("@")[0] ?? "Admin";

  // Verifica se já tem perfil com church_id
  const { data: existing } = await supabase
    .from("users").select("id, church_id").eq("id", user.id).single();

  if (existing?.church_id) {
    return NextResponse.json({ message: "Perfil já configurado", church_id: existing.church_id });
  }

  // Cria a church
  const slug = churchName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 8);

  const { data: church, error: churchErr } = await supabase
    .from("churches")
    .insert({ name: churchName, slug, plan: "free", created_by: user.id })
    .select().single();

  if (churchErr) return NextResponse.json({ error: churchErr.message, step: "church" }, { status: 500 });

  // Cria ou atualiza o perfil
  if (existing) {
    const { error: updateErr } = await supabase
      .from("users")
      .update({ church_id: church.id, name: userName, email: user.email ?? "" })
      .eq("id", user.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message, step: "update" }, { status: 500 });
  } else {
    const { error: insertErr } = await supabase
      .from("users")
      .insert({ id: user.id, church_id: church.id, email: user.email ?? "", name: userName, role: "church_admin", created_by: user.id });
    if (insertErr) return NextResponse.json({ error: insertErr.message, step: "insert" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, church_id: church.id, church_name: church.name });
}
