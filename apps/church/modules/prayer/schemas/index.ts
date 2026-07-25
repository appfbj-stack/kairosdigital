import { z } from "zod";

export const createPrayerSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().min(10, "Descreva o pedido de oração"),
  is_anonymous: z.boolean().default(false),
});

export type CreatePrayerSchema = z.infer<typeof createPrayerSchema>;
