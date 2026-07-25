"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useCreatePrayer } from "../hooks/use-prayer";

const schema = z.object({
  title: z.string().min(3, "Título obrigatório (mín. 3 caracteres)"),
  description: z.string().min(10, "Descreva o pedido (mín. 10 caracteres)"),
  is_anonymous: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export function PrayerForm() {
  const router = useRouter();
  const createPrayer = useCreatePrayer();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPrayer.mutateAsync(data);
      toast.success("Pedido de oração enviado!");
      router.push("/prayer");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Erro ao enviar pedido");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Título *</label>
        <input
          {...register("title")}
          placeholder="Cura para minha família"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pedido *</label>
        <textarea
          {...register("description")}
          rows={6}
          placeholder="Compartilhe seu pedido de oração..."
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
        {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
        <input
          {...register("is_anonymous")}
          type="checkbox"
          id="is_anonymous"
          className="w-4 h-4 rounded border-border accent-primary"
        />
        <label htmlFor="is_anonymous" className="text-sm">
          Enviar anonimamente
          <span className="block text-xs text-muted-foreground">Seu nome não será exibido</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/prayer")}
          className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
        </button>
      </div>
    </form>
  );
}
