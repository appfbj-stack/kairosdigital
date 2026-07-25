import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Phone, Mail, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { VolunteerActions } from "./volunteer-actions";

const PERIOD_LABELS: Record<string, string> = {
  domingo_manha: "Domingo — manhã", domingo_tarde: "Domingo — tarde", domingo_noite: "Domingo — noite",
  quarta_noite: "Quarta — noite", sexta_noite: "Sexta — noite",
  sabado_manha: "Sábado — manhã", sabado_noite: "Sábado — noite",
};

export default async function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("*, member:members!member_id(id, name, avatar_url, phone, email, status), ministry:ministries!ministry_id(id, name, color)")
    .eq("id", id)
    .single();

  if (!volunteer) notFound();

  const member = Array.isArray(volunteer.member) ? volunteer.member[0] : volunteer.member;
  const ministry = Array.isArray(volunteer.ministry) ? volunteer.ministry[0] : volunteer.ministry;
  const avail = (volunteer.availability as string[] | null) ?? [];

  // Próximas escalas
  const today = new Date().toISOString().split("T")[0];
  const { data: schedules } = await supabase
    .from("volunteer_schedules")
    .select("*")
    .eq("volunteer_id", id)
    .gte("date", today!)
    .order("date")
    .limit(5);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/volunteers" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{member?.name ?? "Voluntário"}</h1>
          <p className="text-primary text-sm font-medium">{volunteer.role}</p>
        </div>
        <Link href={`/volunteers/${id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Perfil */}
      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <MemberAvatar name={member?.name ?? "?"} avatarUrl={member?.avatar_url} size="lg" />
          <div>
            <h2 className="text-lg font-semibold">{member?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${volunteer.active !== false ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
                {volunteer.active !== false ? "Ativo" : "Inativo"}
              </span>
              {ministry && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ministry.color ?? "#7C3AED" }} />
                  {ministry.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {member?.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium">{member.phone}</p>
              </div>
            </div>
          )}
          {member?.email && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{member.email}</p>
              </div>
            </div>
          )}
        </div>

        {avail.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Disponibilidade</p>
            <div className="flex flex-wrap gap-2">
              {avail.map((a: string) => (
                <span key={a} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
                  {PERIOD_LABELS[a] ?? a}
                </span>
              ))}
            </div>
          </div>
        )}

        {volunteer.notes && (
          <div>
            <p className="text-sm font-medium mb-1">Observações</p>
            <p className="text-sm text-muted-foreground">{volunteer.notes}</p>
          </div>
        )}
      </div>

      {/* Próximas escalas */}
      {schedules && schedules.length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" />
            Próximas Escalas
          </h2>
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">
                  {new Date(s.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                  {s.period && <span className="text-muted-foreground ml-1">— {s.period}</span>}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.confirmed ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"}`}>
                  {s.confirmed ? "Confirmado" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <VolunteerActions volunteerId={id} isActive={volunteer.active !== false} memberId={member?.id} />
    </div>
  );
}
