"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Check, Zap, Star, Crown } from "lucide-react";

const PLANS = [
  {
    slug: "free",
    name: "Gratuito",
    price: 0,
    priceLabel: "R\$ 0",
    period: "",
    icon: Zap,
    color: "border-zinc-700",
    badge: null,
    features: [
      "Até 10 membros",
      "Chat de membros",
      "20 mensagens Kairos AI/mês",
      "Dashboard básico",
    ],
    cta: "Plano atual",
    disabled: true,
  },
  {
    slug: "silver",
    name: "Prata",
    price: 37,
    priceLabel: "R\$ 37",
    period: "/mês",
    icon: Star,
    color: "border-purple-500",
    badge: "Popular",
    features: [
      "Até 30 membros",
      "Todos os módulos",
      "Chat completo",
      "500 mensagens Kairos AI/mês",
      "Finanças, Eventos, Sermões",
      "Suporte prioritário",
    ],
    cta: "Assinar Prata",
    disabled: false,
  },
  {
    slug: "gold",
    name: "Ouro",
    price: 97,
    priceLabel: "R\$ 97",
    period: "/mês",
    icon: Crown,
    color: "border-yellow-500",
    badge: "Completo",
    features: [
      "Membros ilimitados",
      "Todos os módulos",
      "Chat completo",
      "2.000 mensagens Kairos AI/mês",
      "Todos os recursos Prata",
      "Relatórios avançados",
      "Suporte VIP",
    ],
    cta: "Assinar Ouro",
    disabled: false,
  },
];

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ payload: string; encodedImage: string } | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(slug: string) {
    setLoading(slug);
    setError(null);
    setPixData(null);
    setInvoiceUrl(null);
    try {
      const res = await fetch("/api/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug, billingType: "PIX" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar cobrança");
      if (data.pix?.payload) setPixData(data.pix);
      else if (data.invoiceUrl) setInvoiceUrl(data.invoiceUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Planos Kairos</h1>
        <p className="text-zinc-400">Escolha o plano ideal para sua igreja</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.slug}
              className={`relative rounded-2xl border-2 ${plan.color} bg-zinc-900 p-6 flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold">{plan.name}</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.priceLabel}</span>
                <span className="text-zinc-400">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !plan.disabled && handleSubscribe(plan.slug)}
                disabled={plan.disabled || loading === plan.slug}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.disabled
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : plan.slug === "gold"
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                } disabled:opacity-50`}
              >
                {loading === plan.slug ? "Gerando PIX..." : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300 text-center">
          {error}
        </div>
      )}

      {pixData && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold mb-4">Pague via PIX</h3>
          <img
            src={`data:image/png;base64,${pixData.encodedImage}`}
            alt="QR Code PIX"
            className="w-48 h-48 mx-auto mb-4"
          />
          <p className="text-xs text-zinc-400 mb-2">Ou copie o código PIX:</p>
          <div className="bg-zinc-800 rounded-lg p-3 text-xs font-mono break-all text-left mb-4">
            {pixData.payload}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(pixData.payload)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Copiar código PIX
          </button>
          <p className="text-xs text-zinc-500 mt-4">
            Após o pagamento, seu plano será ativado automaticamente em até 5 minutos.
          </p>
        </div>
      )}
    </div>
  );
}
