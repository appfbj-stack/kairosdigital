import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAsaasCustomer, findAsaasCustomerByEmail, createAsaasSubscription, createAsaasCharge, getPixQrCode } from "@/lib/asaas";

const PLAN_PRICES: Record<string, number> = {
  silver: 37.00,
  gold: 97.00,
};

function getNextDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { planSlug, billingType = "PIX" } = await req.json() as { planSlug: string; billingType?: string };

    const price = PLAN_PRICES[planSlug];
    if (!price) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const { data: profile } = await supabase.from("users").select("name, email, church_id").eq("id", user.id).single();
    if (!profile?.church_id) return NextResponse.json({ error: "Igreja não encontrada" }, { status: 400 });

    // Buscar ou criar cliente no Asaas
    let asaasCustomer = await findAsaasCustomerByEmail(profile.email || user.email!);
    if (!asaasCustomer) {
      asaasCustomer = await createAsaasCustomer({
        name: profile.name || user.email!.split("@")[0],
        email: profile.email || user.email!,
        externalReference: profile.church_id,
      });
    }

    // Criar cobrança PIX
    const charge = await createAsaasCharge({
      customer: asaasCustomer.id,
      billingType: billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
      value: price,
      dueDate: getNextDueDate(),
      description: `Kairos — Plano ${planSlug === "silver" ? "Prata" : "Ouro"}`,
      externalReference: `${profile.church_id}:${planSlug}`,
    });

    let pixData = null;
    if (billingType === "PIX") {
      pixData = await getPixQrCode(charge.id).catch(() => null);
    }

    return NextResponse.json({
      chargeId: charge.id,
      status: charge.status,
      invoiceUrl: charge.invoiceUrl,
      bankSlipUrl: charge.bankSlipUrl,
      pix: pixData,
    });
  } catch (err) {
    console.error("[Asaas Checkout]", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
