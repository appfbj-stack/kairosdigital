import { createServiceClient } from "@/lib/supabase/server";
import { CreditCard, Church } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0/mês",
    color: "border-gray-300",
    badge: "bg-gray-500/20 text-gray-500",
    features: ["Até 50 membros", "1 usuário admin", "Módulos básicos", "Chat desativado"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "R$ 49/mês",
    color: "border-blue-400",
    badge: "bg-blue-500/20 text-blue-600",
    features: ["Até 200 membros", "5 usuários", "Todos os módulos", "Chat ativo", "Suporte por email"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 99/mês",
    color: "border-purple-400",
    badge: "bg-purple-500/20 text-purple-600",
    features: ["Membros ilimitados", "Usuários ilimitados", "KairosAI incluído", "Relatórios avançados", "Suporte prioritário"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    color: "border-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-600",
    features: ["Multi-campus", "API própria", "Integração personalizada", "SLA garantido", "Gerente de conta"],
  },
];

export default async function AdminPlansPage() {
  const supabase = await createServiceClient();

  const { data: planCounts } = await supabase
    .from("churches")
    .select("plan");

  const counts: Record<string, number> = {};
  (planCounts ?? []).forEach((c: { plan: string }) => {
    counts[c.plan] = (counts[c.plan] ?? 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Planos</h1>
        <p className="text-muted-foreground text-sm">Distribuição de igrejas por plano</p>
      </div>

      {/* Distribuição */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-card border-2 rounded-xl p-4 ${plan.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${plan.badge}`}>
                {plan.name}
              </span>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{counts[plan.id] ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">igrejas</p>
            <p className="text-xs font-medium mt-2">{plan.price}</p>
          </div>
        ))}
      </div>

      {/* Detalhes dos planos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-card border-2 rounded-xl p-5 ${plan.color}`}>
            <h3 className="font-bold mb-1">{plan.name}</h3>
            <p className="text-sm font-semibold text-muted-foreground mb-3">{plan.price}</p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary inline-block shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{counts[plan.id] ?? 0}</span> igrejas ativas
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
