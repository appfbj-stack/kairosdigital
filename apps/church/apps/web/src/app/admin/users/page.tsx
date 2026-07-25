import { createServiceClient } from "@/lib/supabase/server";
import { Users, Search } from "lucide-react";
import { MemberAvatar } from "@/features/members/components/member-avatar";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  church_admin: "Admin",
  pastor: "Pastor",
  leader: "Líder",
  member: "Membro",
  visitor: "Visitante",
};
const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-yellow-500/20 text-yellow-600",
  church_admin: "bg-purple-500/20 text-purple-600",
  pastor: "bg-blue-500/20 text-blue-600",
  leader: "bg-green-500/20 text-green-600",
  member: "bg-gray-500/20 text-gray-500",
  visitor: "bg-orange-500/20 text-orange-600",
};

export default async function AdminUsersPage() {
  const supabase = await createServiceClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, name, role, avatar_url, church_id, created_at, church:churches!church_id(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm">{users?.length ?? 0} usuários no sistema</p>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuário</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Igreja</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MemberAvatar name={u.name} avatarUrl={u.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role] ?? ROLE_COLORS.member}`}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {(u.church as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users?.length && (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
