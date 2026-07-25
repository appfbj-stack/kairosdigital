"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createRoomSchema, type CreateRoomSchema } from "@kairos/chat/schemas";
import { useCreateRoom } from "../hooks/use-rooms";

interface CreateRoomModalProps {
  onClose: () => void;
}

const roomTypes = [
  { value: "general", label: "Geral", description: "Canal aberto para todos" },
  { value: "ministry", label: "Ministério", description: "Canal de um ministério" },
  { value: "cell", label: "Célula", description: "Canal de uma célula" },
] as const;

export function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const createRoom = useCreateRoom();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateRoomSchema>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: { type: "general" },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: CreateRoomSchema) => {
    try {
      await createRoom.mutateAsync(data);
      toast.success("Sala criada!");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar sala");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Nova Sala</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de sala</label>
            <div className="space-y-2">
              {roomTypes.map((t) => (
                <label key={t.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    {...register("type")}
                    type="radio"
                    value={t.value}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome da sala</label>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-background">
              <span className="text-muted-foreground text-sm">#</span>
              <input
                {...register("name")}
                placeholder="ex: avisos-gerais"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
            <input
              {...register("description")}
              placeholder="Sobre o que é esta sala?"
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createRoom.isPending}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {createRoom.isPending ? "Criando..." : "Criar Sala"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
