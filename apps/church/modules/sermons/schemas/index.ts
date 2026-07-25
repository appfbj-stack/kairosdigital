import { z } from "zod";

export const createSermonSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  pastor_id: z.string().uuid("Selecione o pastor"),
  series: z.string().optional(),
  scripture: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal("")),
  audio_url: z.string().url().optional().or(z.literal("")),
  pdf_url: z.string().url().optional().or(z.literal("")),
  preached_at: z.string().min(1, "Data obrigatória"),
});

export type CreateSermonSchema = z.infer<typeof createSermonSchema>;
