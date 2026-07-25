"use client";

import { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Database } from "@kairos/types";
import { formatDate, formatPhone } from "@kairos/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";

type Member = Database["public"]["Tables"]["members"]["Row"];

export function MembersClient({ members }: { members: Member[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-600 dark:text-green-400",
    inactive: "bg-gray-500/20 text-gray-500",
    visitor: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    visitor: "Visitante",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membros</h1>
          <p className="text-muted-foreground text-sm">{members.length} membros cadastrados</p>
        </div>
        <Link href="/members/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Membro
        </Link>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar membro..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {search ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {search
              ? "Tente buscar com outros termos"
              : "Comece adicionando o primeiro membro da sua igreja"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Cadastrado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} onClick={() => router.push(`/members/${member.id}`)} className="border-t hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="sm" />
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {member.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {member.phone ? formatPhone(member.phone) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[member.status]}`}>
                      {statusLabels[member.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {formatDate(member.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
