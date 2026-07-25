import { z } from "zod";

export const createCellSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  leader_id: z.string().uuid("Selecione um líder"),
  meeting_day: z.string().min(1, "Dia da semana obrigatório"),
  meeting_time: z.string().min(1, "Horário obrigatório"),
  address: z.string().optional(),
});

export const updateCellSchema = createCellSchema.partial();

export type CreateCellSchema = z.infer<typeof createCellSchema>;
export type UpdateCellSchema = z.infer<typeof updateCellSchema>;
