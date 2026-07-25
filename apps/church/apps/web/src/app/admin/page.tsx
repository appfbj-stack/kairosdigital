import { createServiceClient } from "@/lib/supabase/server";
import { Church, Users, MessageSquare, BookOpen, HeartHandshake, DollarSign } from "lucide-react";
import { formatCurrency } from "@kairos/utils";

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  const [
    { count: totalChurches },
    { count: totalUsers },
    { count: totalMembers },
    { count: totalSermons },
    { count: totalPrayers },
    { data: transactionsData },
    { data: recentChurches },
  ] = await Promise.all([
    supabase.from("churches").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("sermons").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("amount").eq("type", "income"),
    supabase.from("churches").select("id, name, plan, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalRevenue = (transactionsData ?? []).reduce((s: number, t: { amount: number }) => s + (t.amount ?? 0), 0);

  const stats = [
    { label: "Igrejas", value: String(totalChurches ?? 0), icon: Church, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Usuários", value: String(totalUsers ?? 0), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Membros", value: String(totalMembers ?? 0), icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Sermões", value: String(totalSermons ?? 0), icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pedidos de Oração", value: String(totalPrayers ?? 0), icon: HeartHandshake, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Receita Total", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const PLAN_LABELS: Record<string, string> = { free: "Gratuito", starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
  const PLAN_COLORS: Record<string, string> = {
    free: "bg-gray-500/20 text-gray-500",
    starter: "bg-blue-500/20 text-blue-600",
    pro: "bg-purple-500/20 text-purple-600",
    enterprise: "bg-yellow-500/20 text-yellow-600",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Visão Geral da Plataforma</h1>
        <p className="text-muted-foreground text-sm">Dados consolidados de todas as igrejas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Igrejas recentes */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Igrejas Recentes</h2>
          <a href="/admin/churches" className="text-xs text-yellow-500 hover:underline">Ver todas →</a>
        </div>
        {!recentChurches?.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma igreja cadastrada</p>
        ) : (
          <div className="space-y-2">
            {recentChurches.map((church) => (
              <div key={church.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Church className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{church.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(church.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_COLORS[church.plan] ?? PLAN_COLORS.free}`}>
                  {PLAN_LABELS[church.plan] ?? church.plan}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
