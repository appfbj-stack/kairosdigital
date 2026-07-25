import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
          const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
          if (!url || !key) return NextResponse.json({ error: "config" }, { status: 500 });
          const db = createClient(url, key);
          const body = await req.json();
          const { event, payment } = body as { event: string; payment: Record<string, string> };
          if (!event || !payment) return NextResponse.json({ ok: true });
          const ref = payment.externalReference;
          if (!ref) return NextResponse.json({ ok: true });
          const [churchId, planSlug] = ref.split(":");
          if (!churchId) return NextResponse.json({ ok: true });
          if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
                  const { data: plan } = await db.from("plans").select("id,slug").eq("slug", planSlug || "silver").single();
                  if (plan) {
                            await db.from("church_subscriptions").upsert({ church_id: churchId, plan_id: plan.id, status: "active", updated_at: new Date().toISOString() }, { onConflict: "church_id" });
                            await db.from("churches").update({ plan: plan.slug }).eq("id", churchId);
                  }
          }
          if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_CANCELED" || event === "SUBSCRIPTION_CANCELED") {
                  const { data: free } = await db.from("plans").select("id").eq("slug", "free").single();
                  if (free) {
                            await db.from("church_subscriptions").update({ plan_id: free.id, status: "inactive", updated_at: new Date().toISOString() }).eq("church_id", churchId);
                            await db.from("churches").update({ plan: "free" }).eq("id", churchId);
                  }
          }
          return NextResponse.json({ ok: true });
    } catch (err) {
          console.error("[Asaas Webhook]", err);
          return NextResponse.json({ error: "internal" }, { status: 500 });
    }
}
