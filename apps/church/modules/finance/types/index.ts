export type TransactionType = "income" | "expense";
export type PaymentMethod = "pix" | "cash" | "transfer" | "card";

export interface Transaction {
  id: string;
  churchId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  memberId: string | null;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: Record<string, number>;
}

export const INCOME_CATEGORIES = [
  "Dízimo", "Oferta", "Oferta Especial", "Campanha", "Doação", "Outro",
] as const;

export const EXPENSE_CATEGORIES = [
  "Aluguel", "Água/Luz", "Internet", "Equipamento", "Evento", "Manutenção",
  "Salário", "Missões", "Material", "Outro",
] as const;

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  transfer: "Transferência",
  card: "Cartão",
};
