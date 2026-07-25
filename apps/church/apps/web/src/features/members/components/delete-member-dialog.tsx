"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteMember } from "../hooks/use-members";

export function DeleteMemberDialog({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [open, setOpen] = useState(false);
  const deleteMember = useDeleteMember();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteMember.mutateAsync(memberId);
      toast.success("Membro removido");
      router.push("/members");
    } catch {
      toast.error("Erro ao remover membro");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Remover
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-2">Remover membro?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Isso vai remover <strong>{memberName}</strong> permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMember.isPending}
                className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {deleteMember.isPending ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
