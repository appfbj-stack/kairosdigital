"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useFinanceSummary } from "../hooks/use-transactions";
import { formatCurrency } from "@kairos/utils";

export function FinanceDashboard({ month }: { month?: string }) {
  const { data: summary, isLoading } = useFinanceSummary(month);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total de Entradas",
      value: summary?.totalIncome ?? 0,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total de Saídas",
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Saldo",
      value: summary?.balance ?? 0,
      icon: Wallet,
      color: (summary?.balance ?? 0) >= 0 ? "text-primary" : "text-destructive",
      bg: (summary?.balance ?? 0) >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatCurrency(value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
