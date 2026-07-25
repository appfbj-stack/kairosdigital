"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTransactionSchema, type CreateTransactionSchema } from "@kairos/finance/schemas";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@kairos/finance/types";
import { useCreateTransaction, useUpdateTransaction } from "../hooks/use-transactions";
import { useState } from "react";
import type { Database } from "@kairos/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

interface TransactionFormProps {
  transaction?: Transaction;
}

export function TransactionForm({ transaction }: TransactionFormProps) {
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = !!transaction;

  const [type, setType] = useState<"income" | "expense">(
    transaction?.type ?? "income"
  );

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateTransactionSchema>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description ?? "",
          date: transaction.date,
          payment_method: transaction.payment_method,
          member_id: transaction.member_id ?? "",
        }
      : {
          type: "income",
          payment_method: "pix",
          date: new Date().toISOString().split("T")[0],
        },
  });

  const handleTypeChange = (t: "income" | "expense") => {
    setType(t);
    setValue("type", t);
    setValue("category", "");
  };

  const onSubmit = async (data: CreateTransactionSchema) => {
    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          ...data,
          member_id: data.member_id || null,
        });
        toast.success("Transação atualizada!");
        router.push("/finance");
      } else {
        await createTransaction.mutateAsync({
          ...data,
          member_id: data.member_id || undefined,
        });
        toast.success("Transação registrada!");
        router.push("/finance");
      }
    } catch {
      toast.error("Erro ao salvar transação");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium mb-2">Tipo</label>
        <div className="grid grid-cols-2 gap-2">
          {(["income", "expense"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                type === t
                  ? t === "income"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-red-500 text-white border-red-500"
                  : "hover:bg-muted border-input"
              }`}
            >
              {t === "income" ? "Entrada" : "Saída"}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("type")} />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium mb-1">Categoria *</label>
        <select {...register("category")} className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Selecione uma categoria</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium mb-1">Valor *</label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card focus-within:ring-2 focus-within:ring-primary">
          <span className="text-muted-foreground text-sm">R$</span>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Data e Forma de Pagamento */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data *</label>
          <input {...register("date")} type="date" className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Forma de pagamento</label>
          <select {...register("payment_method")} className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          {...register("description")}
          rows={2}
          placeholder="Observações opcionais..."
          className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push("/finance")} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
