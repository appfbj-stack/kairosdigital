import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Tag, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteEventButton } from "./delete-event-button";

const EVENT_TYPE_LABELS: Record<string, string> = {
  culto: "Culto", celula: "Célula", conferencia: "Conferência",
  retiro: "Retiro", treinamento: "Treinamento", outro: "Outro",
};
const EVENT_TYPE_COLORS: Record<string, string> = {
  culto: "bg-purple-500/20 text-purple-600",
  celula: "bg-green-500/20 text-green-600",
  conferencia: "bg-blue-500/20 text-blue-600",
  retiro: "bg-orange-500/20 text-orange-600",
  treinamento: "bg-yellow-500/20 text-yellow-600",
  outro: "bg-gray-500/20 text-gray-500",
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();

  if (!event) notFound();

  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/events" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground text-sm">Detalhes do evento</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
          <DeleteEventButton id={id} title={event.title} />
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.outro}`}>
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium">
                {start.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="text-sm font-medium">
                {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {end && ` → ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
              </p>
            </div>
          </div>
          {event.location && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="text-sm font-medium">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Descrição</p>
            <p className="text-sm">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
