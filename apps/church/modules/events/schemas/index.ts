import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().max(1000).optional(),
  start_at: z.string().min(1, "Data/hora de início obrigatória"),
  end_at: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["service", "event", "meeting", "retreat", "other"]).default("event"),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;
