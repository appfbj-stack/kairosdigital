import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { KairosAI } from "@kairos/services-ai";

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  provider: z.string().optional(),
  context: z.object({
    activeModule: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("church_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: church } = await supabase
    .from("churches")
    .select("name")
    .eq("id", profile.church_id)
    .single();

  const response = await KairosAI.complete({
    messages: parsed.data.messages,
    churchId: profile.church_id,
    userId: user.id,
    context: {
      churchName: church?.name,
      userRole: profile.role,
      activeModule: parsed.data.context?.activeModule,
    },
  });

  return NextResponse.json(response);
}
