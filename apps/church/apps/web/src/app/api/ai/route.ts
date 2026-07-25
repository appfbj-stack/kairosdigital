import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { kairosAI, type AIModule } from "@kairos/services-ai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("name, role, church_id")
      .eq("id", user.id)
      .single();

    const { data: church } = profile?.church_id
      ? await supabase.from("churches").select("name, active_modules").eq("id", profile.church_id).single()
      : { data: null };

    const body = await req.json() as {
      messages: Array<{ role: string; content: string }>;
      context?: { churchName?: string; userRole?: string; activeModule?: string };
      module?: AIModule;
        imageUrl?: string;
    };

    const { messages, context, module = "chat", imageUrl } = body;
    const lastMessage = messages.at(-1);
    if (!lastMessage) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const content = await kairosAI(lastMessage.content, {
      churchName: church?.name ?? context?.churchName ?? "Kairos",
      userName: profile?.name,
      userRole: profile?.role ?? context?.userRole,
      activeModule: module,
      activeModules: (church?.active_modules as string[] | undefined) ?? [],
      history,
    }, module, imageUrl);

    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI route error:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
