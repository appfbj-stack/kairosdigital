"use client";

import { useState } from "react";
import { Trash2, Pencil, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTransactions, useDeleteTransaction } from "../hooks/use-transactions";
import { PAYMENT_METHODS } from "@kairos/finance/types";
import { formatCurrency, formatDate } from "@kairos/utils";

export function TransactionList() {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const { data: transactions = [], isLoading } = useTransactions({ type: typeFilter });
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta transação?")) return;
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success("Transação removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === f ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
            }`}
          >
            {f === "all" ? "Todos" : f === "income" ? "Entradas" : "Saídas"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-lg border bg-card animate-pulse" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Pagamento</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Descrição</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    {t.type === "income" ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{t.category}</td>
                  <td className={`px-4 py-3 font-semibold ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {PAYMENT_METHODS[t.payment_method as keyof typeof PAYMENT_METHODS]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs max-w-xs truncate">
                    {t.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/finance/${t.id}/edit`}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
