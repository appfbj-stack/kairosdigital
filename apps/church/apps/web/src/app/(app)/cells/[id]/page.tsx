import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Clock, MapPin, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";

export const metadata = { title: "Célula — Kairos" };

export default async function CellDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: cell }, { data: cellMembers }] = await Promise.all([
    supabase.from("cells").select("*, leader:members!leader_id(name, email, phone)").eq("id", id).single(),
    supabase.from("members").select("id, name, avatar_url, status, phone, email").eq("cell_id", id).order("name"),
  ]);

  if (!cell) notFound();

  const leader = Array.isArray(cell.leader) ? cell.leader[0] : cell.leader;

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-600 dark:text-green-400",
    inactive: "bg-gray-500/20 text-gray-500",
    visitor: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  };
  const statusLabels: Record<string, string> = { active: "Ativo", inactive: "Inativo", visitor: "Visitante" };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/cells" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{cell.name}</h1>
          <p className="text-muted-foreground text-sm">
            {cellMembers?.length ?? 0} membros
          </p>
        </div>
        <Link
          href={`/cells/${id}/edit`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Info */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Informações</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full ${cell.active ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
            {cell.active ? "Ativa" : "Inativa"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Líder</p>
              <p className="text-sm font-medium">{leader?.name ?? "Sem líder"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Reunião</p>
              <p className="text-sm font-medium">{cell.meeting_day} às {cell.meeting_time}</p>
            </div>
          </div>
          {cell.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="text-sm font-medium">{cell.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Membros da célula */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Membros da Célula
          </h2>
          <Link href="/members" className="text-xs text-primary hover:underline">
            Gerenciar membros →
          </Link>
        </div>
        {!cellMembers?.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhum membro atribuído a esta célula. Edite um membro e selecione esta célula.
          </p>
        ) : (
          <div className="space-y-2">
            {cellMembers.map((m) => (
              <Link
                key={m.id}
                href={`/members/${m.id}`}
                className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/30 rounded px-1 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[m.status]}`}>
                  {statusLabels[m.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
