import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
  baptismDate: z.string().optional(),
  status: z.enum(["active", "inactive", "visitor"]).default("active"),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberSchema = z.infer<typeof createMemberSchema>;
export type UpdateMemberSchema = z.infer<typeof updateMemberSchema>;
