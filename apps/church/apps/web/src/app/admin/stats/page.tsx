import { createServiceClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, Users, Church, MessageSquare, HeartHandshake } from "lucide-react";
import { formatCurrency } from "@kairos/utils";

export default async function AdminStatsPage() {
  const supabase = await createServiceClient();

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: newChurches30d },
    { count: newMembers30d },
    { count: newUsers7d },
    { count: messages7d },
    { count: prayers30d },
    { data: incomeData },
  ] = await Promise.all([
    supabase.from("churches").select("*", { count: "exact", head: true }).gte("created_at", last30),
    supabase.from("members").select("*", { count: "exact", head: true }).gte("created_at", last30),
    supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", last7),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", last7),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).gte("created_at", last30),
    supabase.from("transactions").select("amount").eq("type", "income").gte("date", last30.slice(0, 10)),
  ]);

  const income30d = (incomeData ?? []).reduce((s: number, t: { amount: number }) => s + (t.amount ?? 0), 0);

  const metrics = [
    { label: "Novas igrejas (30d)", value: String(newChurches30d ?? 0), icon: Church, color: "text-yellow-500", bg: "bg-yellow-500/10", trend: "+" },
    { label: "Novos membros (30d)", value: String(newMembers30d ?? 0), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+" },
    { label: "Novos usuários (7d)", value: String(newUsers7d ?? 0), icon: Users, color: "text-green-500", bg: "bg-green-500/10", trend: "+" },
    { label: "Mensagens de chat (7d)", value: String(messages7d ?? 0), icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10", trend: "" },
    { label: "Pedidos de oração (30d)", value: String(prayers30d ?? 0), icon: HeartHandshake, color: "text-pink-500", bg: "bg-pink-500/10", trend: "" },
    { label: "Receita registrada (30d)", value: formatCurrency(income30d), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p className="text-muted-foreground text-sm">Métricas de crescimento da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              {trend && (
                <span className="text-xs font-semibold text-green-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  crescendo
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Gráficos detalhados</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Integração com gráficos em desenvolvimento. Em breve: curvas de crescimento, retenção de usuários e análise de engajamento por módulo.
        </p>
        <span className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-yellow-500/10 text-yellow-600">
          Em breve
        </span>
      </div>
    </div>
  );
}
