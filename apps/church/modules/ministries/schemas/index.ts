import { z } from "zod";

export const createMinistrySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().max(300).optional(),
  leader_id: z.string().uuid().optional().or(z.literal("")),
  color: z.string().default("#6366f1"),
  icon: z.string().default("Star"),
});

export type CreateMinistrySchema = z.infer<typeof createMinistrySchema>;
