import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, HandHeart } from "lucide-react";
import { MemberAvatar } from "@/features/members/components/member-avatar";

export const metadata = { title: "Voluntários — Kairos" };

const PERIOD_LABELS: Record<string, string> = {
  domingo_manha: "Dom manhã", domingo_tarde: "Dom tarde", domingo_noite: "Dom noite",
  quarta_noite: "Qua noite", sexta_noite: "Sex noite",
  sabado_manha: "Sáb manhã", sabado_noite: "Sáb noite",
};

export default async function VolunteersPage() {
  const supabase = await createServerClient();

  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("*, member:members!member_id(id, name, avatar_url), ministry:ministries!ministry_id(id, name, color)")
    .order("created_at", { ascending: false });

  const active = volunteers?.filter((v) => v.active !== false) ?? [];
  const inactive = volunteers?.filter((v) => v.active === false) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voluntários</h1>
          <p className="text-muted-foreground text-sm">{active.length} voluntários ativos</p>
        </div>
        <Link
          href="/volunteers/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Voluntário
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <HandHeart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum voluntário cadastrado</h3>
          <p className="mt-1 text-sm text-muted-foreground max-sm">
            Cadastre os voluntários com suas funções e disponibilidade.
          </p>
          <Link href="/volunteers/new" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            Cadastrar primeiro voluntário
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((v) => {
            const member = Array.isArray(v.member) ? v.member[0] : v.member;
            const ministry = Array.isArray(v.ministry) ? v.ministry[0] : v.ministry;
            const avail = (v.availability as string[] | null) ?? [];
            return (
              <Link key={v.id} href={`/volunteers/${v.id}`} className="bg-card border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center gap-3">
                  <MemberAvatar name={member?.name ?? "?"} avatarUrl={member?.avatar_url} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{member?.name ?? "—"}</p>
                    <p className="text-xs text-primary font-medium">{v.role}</p>
                  </div>
                </div>
                {ministry && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ministry.color ?? "#7C3AED" }} />
                    {ministry.name}
                  </div>
                )}
                {avail.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {avail.slice(0, 3).map((a: string) => (
                      <span key={a} className="text-xs bg-muted px-2 py-0.5 rounded-full">{PERIOD_LABELS[a] ?? a}</span>
                    ))}
                    {avail.length > 3 && <span className="text-xs text-muted-foreground">+{avail.length - 3}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Inativos ({inactive.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {inactive.map((v) => {
              const member = Array.isArray(v.member) ? v.member[0] : v.member;
              return (
                <Link key={v.id} href={`/volunteers/${v.id}`} className="bg-card border rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={member?.name ?? "?"} avatarUrl={member?.avatar_url} size="sm" />
                    <div>
                      <p className="font-semibold text-sm">{member?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{v.role}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
