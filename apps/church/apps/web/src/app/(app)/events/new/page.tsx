import { EventForm } from "@/features/events/components/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Evento</h1>
        <p className="text-muted-foreground text-sm">Agende um evento para sua igreja</p>
      </div>
      <EventForm />
    </div>
  );
}
