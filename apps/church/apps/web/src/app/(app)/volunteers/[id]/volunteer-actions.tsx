"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useUpdateVolunteer, useDeleteVolunteer } from "@/features/volunteers/hooks/use-volunteers";
import Link from "next/link";

interface Props {
  volunteerId: string;
  isActive: boolean;
  memberId?: string;
}

export function VolunteerActions({ volunteerId, isActive, memberId }: Props) {
  const router = useRouter();
  const updateVolunteer = useUpdateVolunteer();
  const deleteVolunteer = useDeleteVolunteer();

  const handleToggleActive = async () => {
    try {
      await updateVolunteer.mutateAsync({ id: volunteerId, active: !isActive });
      toast.success(isActive ? "Voluntário inativado" : "Voluntário ativado");
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remover este voluntário? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteVolunteer.mutateAsync(volunteerId);
      toast.success("Voluntário removido");
      router.push("/volunteers");
    } catch {
      toast.error("Erro ao remover voluntário");
    }
  };

  return (
    <div className="flex gap-3 pt-2 border-t">
      {memberId && (
        <Link
          href={`/members/${memberId}`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
        >
          Ver perfil do membro
        </Link>
      )}
      <button
        onClick={handleToggleActive}
        disabled={updateVolunteer.isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
      >
        {isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4 text-green-500" />}
        {isActive ? "Inativar" : "Ativar"}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleteVolunteer.isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 ml-auto"
      >
        <Trash2 className="w-4 h-4" />
        Remover
      </button>
    </div>
  );
}
