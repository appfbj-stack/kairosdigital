import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Categoria obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().optional(),
  date: z.string().min(1, "Data obrigatória"),
  member_id: z.string().uuid().optional().or(z.literal("")),
  payment_method: z.enum(["pix", "cash", "transfer", "card"]).default("pix"),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;
