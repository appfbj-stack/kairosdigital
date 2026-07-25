"use client";

import { useState } from "react";
import { Plus, Newspaper, X } from "lucide-react";
import { toast } from "sonner";
import { MuralPostCard } from "./mural-post-card";
import { useMuralPosts, useCreatePost, POST_TYPES } from "../hooks/use-mural";

const FILTERS = [{ value: "all", label: "Todos" }, ...POST_TYPES.map((t) => ({ value: t.value, label: t.label }))];

interface Props {
  currentUserId: string;
  canPost: boolean;
}

export function MuralClient({ currentUserId, canPost }: Props) {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("aviso");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: posts = [], isLoading } = useMuralPosts(filter);
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error("Preencha título e conteúdo"); return; }
    setIsSubmitting(true);
    try {
      await createPost.mutateAsync({ title: title.trim(), content: content.trim(), type, pinned });
      toast.success("Post publicado!");
      setTitle(""); setContent(""); setType("aviso"); setPinned(false); setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mural da Igreja</h1>
          <p className="text-muted-foreground text-sm">{posts.length} publicações</p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Publicar</>}
          </button>
        )}
      </div>

      {/* Formulário de novo post */}
      {showForm && canPost && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Nova publicação</h2>

          <div className="flex gap-2 flex-wrap">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  type === t.value ? t.color + " ring-1 ring-current" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da publicação *"
            className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Conteúdo da publicação... (versículo, aviso, comunicado)"
            className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Fixar no topo
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isSubmitting ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-xl border bg-card animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <Newspaper className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma publicação ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canPost ? "Clique em Publicar para criar o primeiro post do mural." : "Aguarde as publicações da liderança."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <MuralPostCard
              key={post.id}
              post={post as any}
              currentUserId={currentUserId}
              canManage={canPost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
