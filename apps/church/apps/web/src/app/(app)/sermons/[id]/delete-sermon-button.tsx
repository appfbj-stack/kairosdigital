"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteSermon } from "@/features/sermons/hooks/use-sermons";

export function DeleteSermonButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const deleteSermon = useDeleteSermon();

  const handleDelete = async () => {
    if (!confirm(`Excluir o sermão "${title}"?`)) return;
    try {
      await deleteSermon.mutateAsync(id);
      toast.success("Sermão excluído");
      router.push("/sermons");
    } catch {
      toast.error("Erro ao excluir sermão");
    }
  };

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={deleteSermon.isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-destructive/40 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      Excluir
    </button>
  );
}
