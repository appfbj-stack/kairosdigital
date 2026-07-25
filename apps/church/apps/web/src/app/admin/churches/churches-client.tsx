"use client";

import { useState } from "react";
import { Church, Users, Search } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PLANS = ["free", "starter", "pro", "enterprise"] as const;
const PLAN_LABELS: Record<string, string> = { free: "Gratuito", starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-500",
  starter: "bg-blue-500/20 text-blue-600",
  pro: "bg-purple-500/20 text-purple-600",
  enterprise: "bg-yellow-500/20 text-yellow-600",
};

interface ChurchRow {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  memberCount: number;
  userCount: number;
}

export function ChurchesClient({ churches: initial }: { churches: ChurchRow[] }) {
  const [churches, setChurches] = useState(initial);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const filtered = churches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const changePlan = async (churchId: string, newPlan: string) => {
    setUpdating(churchId);
    try {
      const { error } = await supabase
        .from("churches")
        .update({ plan: newPlan })
        .eq("id", churchId);
      if (error) throw error;
      setChurches((prev) => prev.map((c) => c.id === churchId ? { ...c, plan: newPlan } : c));
      toast.success("Plano atualizado!");
    } catch {
      toast.error("Erro ao atualizar plano");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Igrejas</h1>
        <p className="text-muted-foreground text-sm">{churches.length} igrejas cadastradas</p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar igreja..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Igreja</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Membros</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Usuários</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plano</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((church) => (
              <tr key={church.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Church className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">{church.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{church.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {church.memberCount}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {church.userCount}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={church.plan}
                    onChange={(e) => void changePlan(church.id, e.target.value)}
                    disabled={updating === church.id}
                    className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border-0 outline-none cursor-pointer disabled:opacity-50 ${PLAN_COLORS[church.plan] ?? PLAN_COLORS.free}`}
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p} className="bg-background text-foreground">
                        {PLAN_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                  {new Date(church.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhuma igreja encontrada
          </div>
        )}
      </div>
    </div>
  );
}
