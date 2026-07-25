"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateSermon, useUpdateSermon, usePastors } from "../hooks/use-sermons";

const schema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  pastor_id: z.string().min(1, "Selecione o pastor"),
  series: z.string().optional(),
  scripture: z.string().optional(),
  video_url: z.string().url("URL inválida").optional().or(z.literal("")),
  audio_url: z.string().url("URL inválida").optional().or(z.literal("")),
  pdf_url: z.string().url("URL inválida").optional().or(z.literal("")),
  preached_at: z.string().min(1, "Data obrigatória"),
});
type FormData = z.infer<typeof schema>;

interface SermonFormProps {
  sermon?: {
    id: string;
    title: string;
    pastor_id: string;
    series?: string | null;
    scripture?: string | null;
    video_url?: string | null;
    audio_url?: string | null;
    pdf_url?: string | null;
    preached_at: string;
  };
}

export function SermonForm({ sermon }: SermonFormProps) {
  const router = useRouter();
  const createSermon = useCreateSermon();
  const updateSermon = useUpdateSermon();
  const { data: pastors = [] } = usePastors();
  const isEditing = !!sermon;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: sermon
      ? {
          title: sermon.title,
          pastor_id: sermon.pastor_id,
          series: sermon.series ?? "",
          scripture: sermon.scripture ?? "",
          video_url: sermon.video_url ?? "",
          audio_url: sermon.audio_url ?? "",
          pdf_url: sermon.pdf_url ?? "",
          preached_at: sermon.preached_at,
        }
      : {},
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateSermon.mutateAsync({ id: sermon.id, ...data });
        toast.success("Sermão atualizado!");
        router.push(`/sermons/${sermon.id}`);
      } else {
        await createSermon.mutateAsync(data);
        toast.success("Sermão cadastrado!");
        router.push("/sermons");
      }
    } catch {
      toast.error("Erro ao salvar sermão");
    }
  };

  const urlFields = [
    { name: "video_url" as const, label: "URL do Vídeo", placeholder: "https://youtube.com/..." },
    { name: "audio_url" as const, label: "URL do Áudio", placeholder: "https://..." },
    { name: "pdf_url" as const, label: "URL do PDF", placeholder: "https://..." },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Título *</label>
        <input
          {...register("title")}
          placeholder="A Graça de Deus"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pastor *</label>
        <select
          {...register("pastor_id")}
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">Selecionar pastor</option>
          {pastors.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.pastor_id && <p className="text-destructive text-xs mt-1">{errors.pastor_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Série</label>
          <input
            {...register("series")}
            placeholder="Nome da série"
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passagem</label>
          <input
            {...register("scripture")}
            placeholder="João 3:16"
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data *</label>
        <input
          {...register("preached_at")}
          type="date"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.preached_at && <p className="text-destructive text-xs mt-1">{errors.preached_at.message}</p>}
      </div>

      {urlFields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <input
            {...register(field.name)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {errors[field.name] && <p className="text-destructive text-xs mt-1">{errors[field.name]?.message}</p>}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/sermons")}
          className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
