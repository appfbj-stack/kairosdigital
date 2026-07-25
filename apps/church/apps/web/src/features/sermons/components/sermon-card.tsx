import Link from "next/link";
import { Play, Headphones, FileText, BookOpen, Calendar } from "lucide-react";
import { formatDate } from "@kairos/utils";

interface SermonCardProps {
  sermon: {
    id: string;
    title: string;
    series?: string | null;
    scripture?: string | null;
    video_url?: string | null;
    audio_url?: string | null;
    pdf_url?: string | null;
    preached_at: string;
    pastor?: { name: string; avatar_url?: string | null } | null;
  };
}

export function SermonCard({ sermon }: SermonCardProps) {
  const hasMedia = sermon.video_url || sermon.audio_url || sermon.pdf_url;

  return (
    <Link href={`/sermons/${sermon.id}`} className="block rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          {sermon.series && (
            <p className="text-xs text-primary font-medium mb-0.5">{sermon.series}</p>
          )}
          <h3 className="font-semibold text-sm leading-snug">{sermon.title}</h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(sermon.preached_at)}
        </span>
        {sermon.scripture && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {sermon.scripture}
          </span>
        )}
      </div>

      {sermon.pastor && (
        <p className="text-xs text-muted-foreground mb-3">
          Por <span className="font-medium text-foreground">{sermon.pastor.name}</span>
        </p>
      )}

      {hasMedia && (
        <div className="flex gap-2 flex-wrap">
          {sermon.video_url && (
            <a
              href={sermon.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Vídeo
            </a>
          )}
          {sermon.audio_url && (
            <a
              href={sermon.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              Áudio
            </a>
          )}
          {sermon.pdf_url && (
            <a
              href={sermon.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
        </div>
      )}
    </Link>
  );
}
