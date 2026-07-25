"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateMinistry, useUpdateMinistry } from "../hooks/use-ministries";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  leader_id: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#DB2777", "#0891B2"];
const ICONS = ["music", "heart", "users", "book", "mic", "camera", "star", "cross"];

interface MinistryFormProps {
  ministry?: { id: string; name: string; description?: string | null; color?: string | null; icon?: string | null };
  leaders?: { id: string; name: string }[];
}

export function MinistryForm({ ministry, leaders = [] }: MinistryFormProps) {
  const router = useRouter();
  const createMinistry = useCreateMinistry();
  const updateMinistry = useUpdateMinistry();
  const isEditing = !!ministry;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: ministry
      ? { name: ministry.name, description: ministry.description ?? "", color: ministry.color ?? "#7C3AED", icon: ministry.icon ?? "" }
      : { color: "#7C3AED" },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMinistry.mutateAsync({ id: ministry.id, ...data });
        toast.success("Ministério atualizado!");
        router.push(`/ministries/${ministry.id}`);
      } else {
        await createMinistry.mutateAsync(data);
        toast.success("Ministério criado!");
        router.push("/ministries");
      }
    } catch {
      toast.error("Erro ao salvar ministério");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Nome *</label>
        <input
          {...register("name")}
          placeholder="Ministério de Louvor"
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Descrição do ministério..."
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        />
      </div>

      {leaders.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Líder</label>
          <select
            {...register("leader_id")}
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Selecionar líder</option>
            {leaders.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Cor</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? "border-white scale-110" : "border-transparent"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ícone</label>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue("icon", icon)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${selectedIcon === icon ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/ministries")}
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
