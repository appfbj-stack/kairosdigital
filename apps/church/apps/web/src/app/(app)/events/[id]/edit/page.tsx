import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventForm } from "@/features/events/components/event-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/events/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Evento</h1>
          <p className="text-muted-foreground text-sm">{event.title}</p>
        </div>
      </div>
      <EventForm event={event} />
    </div>
  );
}
