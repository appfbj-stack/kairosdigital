"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pin, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { POST_TYPES, REACTIONS, useToggleReaction, useDeletePost, useTogglePinPost } from "../hooks/use-mural";
import { toast } from "sonner";

interface Reaction { id: string; type: string; user_id: string }
interface Author { id: string; name: string; avatar_url?: string | null; role?: string }

interface MuralPost {
  id: string;
  title: string;
  content: string;
  type: string;
  pinned: boolean;
  created_at: string;
  author?: Author | Author[] | null;
  reactions?: Reaction[];
}

interface Props {
  post: MuralPost;
  currentUserId: string;
  canManage: boolean;
}

export function MuralPostCard({ post, currentUserId, canManage }: Props) {
  const [expanded, setExpanded] = useState(false);
  const toggleReaction = useToggleReaction();
  const deletePost = useDeletePost();
  const togglePin = useTogglePinPost();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const reactions = post.reactions ?? [];
  const postType = POST_TYPES.find((t) => t.value === post.type) ?? POST_TYPES[0]!;
  const isLong = post.content.length > 200;

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
    reacted: reactions.some((rx) => rx.type === r.type && rx.user_id === currentUserId),
  }));

  const handleReaction = async (type: string, hasReacted: boolean) => {
    try {
      await toggleReaction.mutateAsync({ postId: post.id, type, hasReacted });
    } catch {
      toast.error("Erro ao reagir");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este post?")) return;
    try {
      await deletePost.mutateAsync(post.id);
      toast.success("Post excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleTogglePin = async () => {
    try {
      await togglePin.mutateAsync({ id: post.id, pinned: !post.pinned });
      toast.success(post.pinned ? "Post desafixado" : "Post fixado no topo");
    } catch {
      toast.error("Erro ao fixar post");
    }
  };

  return (
    <div className={`bg-card border rounded-xl p-5 space-y-4 ${post.pinned ? "border-primary/40 bg-primary/3" : ""}`}>
      {/* Link para detalhe */}
      <Link href={`/social/${post.id}`} className="block -mx-1 px-1 -mt-1 pt-0.5 hover:text-primary transition-colors group">
        <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary mb-2">
          <ExternalLink className="w-3 h-3" /> Ver publicação completa
        </span>
      </Link>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar name={author?.name ?? "?"} avatarUrl={author?.avatar_url} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{author?.name ?? "—"}</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${postType.color}`}>
                {postType.emoji} {postType.label}
              </span>
              {post.pinned && (
                <span className="inline-flex items-center gap-0.5 text-xs text-primary font-medium">
                  <Pin className="w-3 h-3" /> Fixado
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleTogglePin}
              title={post.pinned ? "Desafixar" : "Fixar no topo"}
              className={`p-1.5 rounded-lg transition-colors ${post.pinned ? "text-primary" : "text-muted-foreground hover:text-primary"} hover:bg-primary/10`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div>
        <h3 className="font-semibold mb-1">{post.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {isLong && !expanded ? `${post.content.slice(0, 200)}...` : post.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
          </button>
        )}
      </div>

      {/* Reações */}
      <div className="flex items-center gap-2 pt-1 border-t">
        {reactionCounts.map((r) => (
          <button
            key={r.type}
            onClick={() => void handleReaction(r.type, r.reacted)}
            disabled={toggleReaction.isPending}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              r.reacted
                ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <span>{r.emoji}</span>
            {r.count > 0 && <span>{r.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
