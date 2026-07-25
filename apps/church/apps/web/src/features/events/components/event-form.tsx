"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateEvent, useUpdateEvent } from "../hooks/use-events";

const EVENT_TYPES = [
  { value: "culto", label: "Culto" },
  { value: "celula", label: "Célula" },
  { value: "conferencia", label: "Conferência" },
  { value: "retiro", label: "Retiro" },
  { value: "treinamento", label: "Treinamento" },
  { value: "outro", label: "Outro" },
];

const schema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().optional(),
  start_at: z.string().min(1, "Data de início obrigatória"),
  end_at: z.string().optional(),
  location: z.string().optional(),
  type: z.string().min(1, "Tipo obrigatório"),
});
type FormData = z.infer<typeof schema>;

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    description?: string | null;
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    type: string;
  };
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEditing = !!event;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description ?? "",
          start_at: event.start_at.slice(0, 16),
          end_at: event.end_at ? event.end_at.slice(0, 16) : "",
          location: event.location ?? "",
          type: event.type,
        }
      : { type: "culto" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        start_at: new Date(data.start_at).toISOString(),
        end_at: data.end_at ? new Date(data.end_at).toISOString() : undefined,
        location: data.location,
        type: data.type,
      };
      if (isEditing) {
        await updateEvent.mutateAsync({ id: event.id, ...payload });
        toast.success("Evento atualizado!");
        router.push(`/events/${event.id}`);
      } else {
        await createEvent.mutateAsync(payload);
        toast.success("Evento criado!");
        router.push("/events");
      }
    } catch {
      toast.error("Erro ao salvar evento");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Título *</label>
        <input
          {...register("title")}
          placeholder="Culto de Celebração"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo *</label>
        <select
          {...register("type")}
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {errors.type && <p className="text-destructive text-xs mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Detalhes do evento..."
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Início *</label>
          <input
            {...register("start_at")}
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {errors.start_at && <p className="text-destructive text-xs mt-1">{errors.start_at.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fim</label>
          <input
            {...register("end_at")}
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Local</label>
        <input
          {...register("location")}
          placeholder="Templo principal"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
