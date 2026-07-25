import { z } from "zod";

export const createCongregationSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  pastorName: z.string().min(3, "Nome do pastor deve ter pelo menos 3 caracteres"),
  pastorEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  pastorPhone: z.string().optional(),
  patrimonio: z.string().optional(),
  address: z.string().optional(),
});

export const updateCongregationSchema = z.object({
  name: z.string().min(3).optional(),
  pastorName: z.string().min(3).optional(),
  pastorEmail: z.string().email().optional().or(z.literal("")),
  pastorPhone: z.string().optional(),
  patrimonio: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateCongregationForm = z.infer<typeof createCongregationSchema>;
export type UpdateCongregationForm = z.infer<typeof updateCongregationSchema>;
