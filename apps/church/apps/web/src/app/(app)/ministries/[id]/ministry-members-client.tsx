"use client";

import { useState } from "react";
import { Users, Plus, Trash2, UserPlus } from "lucide-react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useAddMinistryMember, useRemoveMinistryMember } from "@/features/ministries/hooks/use-ministries";
import { toast } from "sonner";

interface MiniMember {
  id: string;
  name: string;
  avatar_url?: string | null;
  status?: string;
}

interface MinistryMember {
  id: string;
  role: string;
  member?: MiniMember | null;
}

interface Props {
  ministryId: string;
  initialMembers: MinistryMember[];
  allMembers: { id: string; name: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-600 dark:text-green-400",
  inactive: "bg-gray-500/20 text-gray-500",
  visitor: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export function MinistryMembersClient({ ministryId, initialMembers, allMembers }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedRole, setSelectedRole] = useState("membro");

  const addMember = useAddMinistryMember();
  const removeMember = useRemoveMinistryMember();

  // members already in this ministry
  const existingIds = new Set(members.map((m) => m.member?.id).filter(Boolean));
  const available = allMembers.filter((m) => !existingIds.has(m.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    try {
      const newMm = await addMember.mutateAsync({
        ministry_id: ministryId,
        member_id: selectedId,
        role: selectedRole,
      });
      const found = allMembers.find((m) => m.id === selectedId);
      setMembers((prev) => [...prev, { id: newMm.id, role: selectedRole, member: found ? { id: found.id, name: found.name } : undefined }]);
      setSelectedId("");
      setSelectedRole("membro");
      setShowAdd(false);
      toast.success("Membro adicionado ao ministério");
    } catch {
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleRemove = async (mmId: string) => {
    if (!confirm("Remover este membro do ministério?")) return;
    try {
      await removeMember.mutateAsync({ id: mmId, ministry_id: ministryId });
      setMembers((prev) => prev.filter((m) => m.id !== mmId));
      toast.success("Membro removido");
    } catch {
      toast.error("Erro ao remover membro");
    }
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Membros do Ministério
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-muted transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">Adicionar membro</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um membro…</option>
              {available.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {["membro", "líder", "coordenador", "voluntário"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs border rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!selectedId || addMember.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Plus className="w-3 h-3" />
              {addMember.isPending ? "Adicionando…" : "Confirmar"}
            </button>
          </div>
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground">Todos os membros ativos já estão neste ministério.</p>
          )}
        </div>
      )}

      {/* List */}
      {!members.length ? (
        <p className="text-sm text-muted-foreground">Nenhum membro neste ministério ainda.</p>
      ) : (
        <div className="space-y-1">
          {members.map((mm) => (
            <div key={mm.id} className="group flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <MemberAvatar name={mm.member?.name ?? "?"} avatarUrl={mm.member?.avatar_url} size="sm" />
                <div>
                  <p className="text-sm font-medium">{mm.member?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mm.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mm.member?.status && (
                  <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[mm.member.status] ?? STATUS_COLORS.active}`}>
                    {mm.member.status === "active" ? "Ativo" : mm.member.status === "inactive" ? "Inativo" : "Visitante"}
                  </span>
                )}
                <button
                  onClick={() => handleRemove(mm.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
