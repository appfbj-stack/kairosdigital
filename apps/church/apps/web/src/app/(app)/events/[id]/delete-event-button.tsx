"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteEvent } from "@/features/events/hooks/use-events";

export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const deleteEvent = useDeleteEvent();

  const handleDelete = async () => {
    if (!confirm(`Excluir o evento "${title}"?`)) return;
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Evento excluído");
      router.push("/events");
    } catch {
      toast.error("Erro ao excluir evento");
    }
  };

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={deleteEvent.isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-destructive/40 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      Excluir
    </button>
  );
}
