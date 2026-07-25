import { createServerClient } from "@/lib/supabase/server";
import { Users, CircleDot, DollarSign, HeartHandshake, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@kairos/utils";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const churchName = user?.user_metadata?.["church_name"] ?? "Minha Igreja";

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const todayIso = now.toISOString();

  const [
    { count: totalMembers },
    { count: totalCells },
    { count: openPrayers },
    { count: upcomingEvents },
    { data: incomeData },
    { data: recentSermons },
    { data: nextEvents },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("cells").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("start_at", todayIso),
    supabase.from("transactions").select("amount").eq("type", "income").gte("date", firstOfMonth.slice(0, 10)),
    supabase.from("sermons").select("id, title, preached_at, scripture, pastor:users!pastor_id(name)").order("preached_at", { ascending: false }).limit(3),
    supabase.from("events").select("id, title, start_at, type, location").gte("start_at", todayIso).order("start_at", { ascending: true }).limit(4),
  ]);

  const totalIncome = (incomeData ?? []).reduce((sum: number, t: { amount: number }) => sum + (t.amount ?? 0), 0);

  const stats = [
    { label: "Membros Ativos", value: String(totalMembers ?? 0), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", href: "/members" },
    { label: "Células", value: String(totalCells ?? 0), icon: CircleDot, color: "text-green-500", bg: "bg-green-500/10", href: "/cells" },
    { label: "Ofertas do Mês", value: formatCurrency(totalIncome), icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-500/10", href: "/finance" },
    { label: "Pedidos de Oração", value: String(openPrayers ?? 0), icon: HeartHandshake, color: "text-pink-500", bg: "bg-pink-500/10", href: "/prayer" },
    { label: "Próximos Eventos", value: String(upcomingEvents ?? 0), icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10", href: "/events" },
    { label: "Sermões", value: String(recentSermons?.length ?? 0), icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10", href: "/sermons" },
  ];

  const EVENT_TYPE_LABELS: Record<string, string> = {
    culto: "Culto", celula: "Célula", conferencia: "Conferência",
    retiro: "Retiro", treinamento: "Treinamento", outro: "Outro",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta 👋</h1>
        <p className="text-muted-foreground">{churchName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-card border rounded-xl p-5 flex items-center gap-4 hover:border-primary/50 transition-colors">
            <div className={`p-3 rounded-xl shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Eventos */}
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Próximos Eventos</h2>
            <Link href="/events" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {!nextEvents?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
          ) : (
            <div className="space-y-3">
              {nextEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center bg-primary/10 rounded-lg px-2.5 py-1.5 shrink-0 min-w-[44px] text-center">
                    <span className="text-[10px] text-primary font-medium uppercase">
                      {new Date(ev.start_at).toLocaleDateString("pt-BR", { month: "short" })}
                    </span>
                    <span className="text-base font-bold text-primary leading-none">
                      {new Date(ev.start_at).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sermões Recentes */}
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Sermões Recentes</h2>
            <Link href="/sermons" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {!recentSermons?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum sermão cadastrado</p>
          ) : (
            <div className="space-y-3">
              {recentSermons.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(s.pastor as { name: string } | null)?.name ?? "—"} · {formatDate(s.preached_at)}
                      {s.scripture ? ` · ${s.scripture}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KairosAI teaser */}
      <Link href="/ai" className="block bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">✨</div>
          <div>
            <h2 className="font-semibold">Kairos AI</h2>
            <p className="text-sm text-muted-foreground">Assistente pastoral com IA · Pergunte, reflita, planeje</p>
          </div>
          <span className="ml-auto text-primary text-sm font-medium">Abrir →</span>
        </div>
      </Link>
    </div>
  );
}
