"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Users, Target, Clock, TrendingUp, Menu, X, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { WhatsAppConnect } from "@/components/WhatsAppConnect";
import { ChatWidget } from "@/components/ChatWidget";
import { LeadsList } from "@/components/LeadsList";
import { leadsApi, dealsApi, tasksApi, authApi } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

export default function PainelPage() {
  const router = useRouter();
  const { token, tenant, logout, setAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ leads: 0, deals: 0, value: 0, tasks: 0 });
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    // Validate token
    authApi.me().then(res => setAuth(token, res.data)).catch(() => { logout(); router.push("/login"); });
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [leadsRes, dealsRes, tasksRes, pipeRes] = await Promise.all([
        leadsApi.stats(),
        dealsApi.pipeline(),
        tasksApi.upcoming(7),
        dealsApi.pipeline(),
      ]);
      setStats({
        leads: leadsRes.data.total,
        deals: pipeRes.data.reduce((s: number, p: any) => s + p.count, 0),
        value: pipeRes.data.reduce((s: number, p: any) => s + p.totalValue, 0),
        tasks: tasksRes.data.length,
      });
      setPipeline(pipeRes.data);
      setUpcomingTasks(tasksRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const primaryColor = tenant?.primaryColor || "#2563eb";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r transform transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-lg">{tenant?.tradeName || tenant?.name}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
        </div>
        <nav className="p-4 space-y-1">
          <a href="#dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><LayoutDashboard className="w-5 h-5" /> Dashboard</a>
          <a href="#leads" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Users className="w-5 h-5" /> Leads</a>
          <a href="#deals" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Target className="w-5 h-5" /> Negociações</a>
          <a href="#tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Clock className="w-5 h-5" /> Tarefas</a>
          <a href="#whatsapp" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: primaryColor }}><MessageSquare className="w-5 h-5" /> WhatsApp</a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut className="w-5 h-5" /> Sair</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu className="w-6 h-6" /></button>
          <h1 className="text-lg font-semibold lg:ml-4">Painel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{tenant?.vertical}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} title="Leads" value={stats.leads} color="blue" />
            <StatCard icon={Target} title="Negociações" value={stats.deals} color="purple" />
            <StatCard icon={TrendingUp} title="Valor Total" value={formatCurrency(stats.value)} color="green" />
            <StatCard icon={Clock} title="Tarefas (7d)" value={stats.tasks} color="orange" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pipeline */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold mb-4">Funil de Vendas</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {pipeline.map((stage: any) => (
                  <div key={stage.stage} className="min-w-[200px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color || "#6366f1" }} />
                      <span className="font-medium text-sm">{stage.stage}</span>
                      <span className="ml-auto text-xs text-gray-500">{stage.count} • {formatCurrency(stage.totalValue)}</span>
                    </div>
                    <div className="space-y-2 min-h-[200px]" style={{ backgroundColor: stage.color + "15", borderRadius: "8px", padding: "8px" }}>
                      {/* Aqui entrariam os cards de deals - simplificado */}
                      <p className="text-sm text-gray-500 text-center py-8">{stage.count} negociações</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar right */}
            <div className="space-y-6">
              {/* WhatsApp Connect */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> WhatsApp</h2>
                <WhatsAppConnect />
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
                <h2 className="font-semibold mb-4">Próximas Tarefas</h2>
                {upcomingTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Nenhuma tarefa agendada</p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingTasks.slice(0, 5).map((task: any) => (
                      <li key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.lead?.name} • {task.dueAt ? new Date(task.dueAt).toLocaleString("pt-BR") : "Sem prazo"}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Leads List + Chat */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LeadsList />
            </div>
            <div>
              <div className="bg-white dark:bg-gray-900 border rounded-xl h-[600px]">
                <div className="p-4 border-b"><h2 className="font-semibold flex items-center gap-2"><Bot className="w-5 h-5" /> Assistente Hermes</h2></div>
                <div className="h-[560px] p-4">
                  <ChatWidget />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: any) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-lg", colors[color])}><Icon className="w-6 h-6" /></div>
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}