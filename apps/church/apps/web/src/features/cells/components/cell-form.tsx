"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCell, useUpdateCell, useLeaders } from "../hooks/use-cells";
import { createCellSchema, type CreateCellSchema } from "@kairos/cells/schemas";
import { MEETING_DAYS } from "@kairos/cells/types";

interface CellFormProps {
  cell?: { id: string; name: string; leader_id: string; meeting_day: string; meeting_time: string; address: string | null };
}

export function CellForm({ cell }: CellFormProps) {
  const router = useRouter();
  const { data: leaders = [] } = useLeaders();
  const createCell = useCreateCell();
  const updateCell = useUpdateCell();
  const isEditing = !!cell;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateCellSchema>({
    resolver: zodResolver(createCellSchema),
    defaultValues: cell
      ? { name: cell.name, leader_id: cell.leader_id, meeting_day: cell.meeting_day, meeting_time: cell.meeting_time, address: cell.address ?? "" }
      : {},
  });

  const onSubmit = async (data: CreateCellSchema) => {
    try {
      if (isEditing) {
        await updateCell.mutateAsync({ id: cell.id, ...data });
        toast.success("Célula atualizada!");
      } else {
        await createCell.mutateAsync(data);
        toast.success("Célula criada!");
      }
      router.push("/cells");
    } catch {
      toast.error("Erro ao salvar célula");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Nome da célula *</label>
        <input {...register("name")} placeholder="Célula da Esperança" className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Líder *</label>
        <select {...register("leader_id")} className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Selecione um líder</option>
          {leaders.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        {errors.leader_id && <p className="text-destructive text-xs mt-1">{errors.leader_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dia da semana *</label>
          <select {...register("meeting_day")} className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Selecione</option>
            {MEETING_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.meeting_day && <p className="text-destructive text-xs mt-1">{errors.meeting_day.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horário *</label>
          <input {...register("meeting_time")} type="time" className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.meeting_time && <p className="text-destructive text-xs mt-1">{errors.meeting_time.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Endereço</label>
        <input {...register("address")} placeholder="Rua das Flores, 123 — Bairro" className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push("/cells")} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar Célula"}
        </button>
      </div>
    </form>
  );
}
