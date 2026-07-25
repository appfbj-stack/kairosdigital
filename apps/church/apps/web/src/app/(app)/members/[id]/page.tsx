import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Droplets, CircleDot } from "lucide-react";
import Link from "next/link";
import { MemberProfileClient } from "./member-profile-client";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { formatDate } from "@kairos/utils";

export const metadata = { title: "Perfil do Membro — Kairos" };

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: member } = await supabase
    .from("members").select("*").eq("id", id).single();

  if (!member) notFound();

  const cell = member.cell_id
    ? (await supabase.from("cells").select("id, name").eq("id", member.cell_id).single()).data
    : null;

  const statusConfig = {
    active: { label: "Ativo", className: "bg-green-500/20 text-green-600 dark:text-green-400" },
    inactive: { label: "Inativo", className: "bg-gray-500/20 text-gray-500" },
    visitor: { label: "Visitante", className: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  };

  const status = statusConfig[member.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/members" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground text-sm">Perfil do membro</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-5">
          <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="lg" />
          <div>
            <h2 className="text-xl font-semibold">{member.name}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {member.email && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{member.email}</p>
              </div>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium">{member.phone}</p>
              </div>
            </div>
          )}
          {member.birthdate && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Nascimento</p>
                <p className="text-sm font-medium">{formatDate(member.birthdate)}</p>
              </div>
            </div>
          )}
          {member.baptism_date && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Droplets className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Batismo</p>
                <p className="text-sm font-medium">{formatDate(member.baptism_date)}</p>
              </div>
            </div>
          )}
          {cell && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CircleDot className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Célula</p>
                <Link href={`/cells/${cell.id}`} className="text-sm font-medium hover:text-primary hover:underline transition-colors">
                  {cell.name}
                </Link>
              </div>
            </div>
          )}
        </div>

        <MemberProfileClient member={member} />
      </div>
    </div>
  );
}
