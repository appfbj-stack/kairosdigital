"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { REACTIONS, useToggleReaction, useDeletePost } from "@/features/social/hooks/use-mural";

interface Props {
  postId: string;
  currentUserId: string;
  reactions: Array<{ id: string; type: string; user_id: string }>;
  canManage: boolean;
}

export function MuralPostDetail({ postId, currentUserId, reactions, canManage }: Props) {
  const router = useRouter();
  const toggleReaction = useToggleReaction();
  const deletePost = useDeletePost();

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
    reacted: reactions.some((rx) => rx.type === r.type && rx.user_id === currentUserId),
  }));

  const handleReaction = async (type: string, hasReacted: boolean) => {
    try {
      await toggleReaction.mutateAsync({ postId, type, hasReacted });
      router.refresh();
    } catch {
      toast.error("Erro ao reagir");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir esta publicação?")) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Publicação excluída");
      router.push("/social");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t">
      {/* Reações */}
      <div className="flex items-center gap-2 flex-wrap">
        {reactionCounts.map((r) => (
          <button
            key={r.type}
            onClick={() => void handleReaction(r.type, r.reacted)}
            disabled={toggleReaction.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              r.reacted
                ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <span className="text-base">{r.emoji}</span>
            {r.count > 0 && <span>{r.count}</span>}
          </button>
        ))}
      </div>

      {/* Ação de excluir */}
      {canManage && (
        <button
          onClick={handleDelete}
          disabled={deletePost.isPending}
          className="flex items-center gap-2 px-3 py-2 text-sm text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Excluir publicação
        </button>
      )}
    </div>
  );
}
