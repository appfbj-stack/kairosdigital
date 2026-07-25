import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin } from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { MuralPostDetail } from "./mural-post-detail";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const POST_TYPES: Record<string, { label: string; emoji: string; color: string }> = {
  aviso:       { label: "Aviso",       emoji: "📢", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  versiculo:   { label: "Versículo",   emoji: "📖", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  comunicado:  { label: "Comunicado",  emoji: "📋", color: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  celebracao:  { label: "Celebração",  emoji: "🎉", color: "bg-green-500/20 text-green-600 dark:text-green-400" },
  evento:      { label: "Evento",      emoji: "📅", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
};

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("mural_posts")
    .select("*, author:users!author_id(id, name, avatar_url, role), reactions:mural_reactions(id, type, user_id)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user!.id).single();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const postType = POST_TYPES[post.type] ?? POST_TYPES["aviso"]!;
  const canManage = ["church_admin", "pastor", "leader", "super_admin"].includes(profile?.role ?? "");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/social" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Publicação do Mural</h1>
          <p className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        {/* Tipo + Autor */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MemberAvatar name={author?.name ?? "?"} avatarUrl={author?.avatar_url} size="sm" />
            <div>
              <p className="text-sm font-semibold">{author?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.pinned && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <Pin className="w-3 h-3" /> Fixado
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${postType.color}`}>
              {postType.emoji} {postType.label}
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          <h2 className="text-lg font-bold mb-2">{post.title}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{post.content}</p>
        </div>

        {/* Reações interativas */}
        <MuralPostDetail
          postId={post.id}
          currentUserId={user!.id}
          reactions={(post.reactions ?? []) as Array<{ id: string; type: string; user_id: string }>}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
