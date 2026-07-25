"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, Clock, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteEvent } from "@/features/events/hooks/use-events";
import { formatDate } from "@kairos/utils";

const EVENT_TYPE_COLORS: Record<string, string> = {
  culto: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  celula: "bg-green-500/20 text-green-600 dark:text-green-400",
  conferencia: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  retiro: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  treinamento: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  outro: "bg-gray-500/20 text-gray-500",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  culto: "Culto",
  celula: "Célula",
  conferencia: "Conferência",
  retiro: "Retiro",
  treinamento: "Treinamento",
  outro: "Outro",
};

interface ChurchEvent {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
  type: string;
}

export function EventsClient({ events: initial }: { events: ChurchEvent[] }) {
  const [events, setEvents] = useState(initial);
  const [filter, setFilter] = useState<"all" | "upcoming">("upcoming");
  const deleteEvent = useDeleteEvent();
  const router = useRouter();

  const now = new Date().toISOString();
  const filtered = filter === "upcoming"
    ? events.filter((e) => e.start_at >= now)
    : events;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir o evento "${title}"?`)) return;
    try {
      await deleteEvent.mutateAsync(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Evento excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} eventos</p>
        </div>
        <Link
          href="/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
        </Link>
      </div>

      <div className="flex gap-2">
        {(["upcoming", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {f === "upcoming" ? "Próximos" : "Todos"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum evento encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {filter === "upcoming" ? "Não há eventos futuros agendados" : "Crie o primeiro evento"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const isPast = event.start_at < now;
            return (
              <div
                key={event.id}
                onClick={() => !isPast && router.push(`/events/${event.id}`)}
                className={`rounded-lg border bg-card p-4 group transition-colors ${isPast ? "opacity-60" : "hover:border-primary/50 cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex flex-col items-center bg-primary/10 rounded-lg px-3 py-2 shrink-0 min-w-[52px]">
                      <span className="text-xs text-primary font-medium">
                        {new Date(event.start_at).toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}
                      </span>
                      <span className="text-lg font-bold text-primary leading-none">
                        {new Date(event.start_at).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{event.title}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.outro}`}>
                          {EVENT_TYPE_LABELS[event.type] ?? event.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {event.end_at && ` – ${new Date(event.end_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(event.id, event.title)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
