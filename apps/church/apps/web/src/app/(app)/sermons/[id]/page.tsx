import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Headphones, FileText, BookOpen, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@kairos/utils";
import { DeleteSermonButton } from "./delete-sermon-button";

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: sermon } = await supabase
    .from("sermons")
    .select("*, pastor:users!pastor_id(name, avatar_url)")
    .eq("id", id)
    .single();

  if (!sermon) notFound();
  const pastor = sermon.pastor as { name: string; avatar_url?: string | null } | null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/sermons" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          {sermon.series && <p className="text-xs text-primary font-medium">{sermon.series}</p>}
          <h1 className="text-2xl font-bold truncate">{sermon.title}</h1>
        </div>
        <Link
          href={`/sermons/${id}/edit`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
        <DeleteSermonButton id={id} title={sermon.title} />
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-purple-500">{pastor?.name?.[0]?.toUpperCase() ?? "?"}</span>
          </div>
          <div>
            <p className="font-semibold">{pastor?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Pastor</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Pregado em</p>
              <p className="text-sm font-medium">{formatDate(sermon.preached_at)}</p>
            </div>
          </div>
          {sermon.scripture && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Passagem</p>
                <p className="text-sm font-medium">{sermon.scripture}</p>
              </div>
            </div>
          )}
        </div>

        {(sermon.video_url || sermon.audio_url || sermon.pdf_url) && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Recursos</p>
            <div className="flex gap-2 flex-wrap">
              {sermon.video_url && (
                <a href={sermon.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
                  <Play className="w-4 h-4" /> Assistir vídeo
                </a>
              )}
              {sermon.audio_url && (
                <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors">
                  <Headphones className="w-4 h-4" /> Ouvir áudio
                </a>
              )}
              {sermon.pdf_url && (
                <a href={sermon.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors">
                  <FileText className="w-4 h-4" /> Abrir PDF
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
