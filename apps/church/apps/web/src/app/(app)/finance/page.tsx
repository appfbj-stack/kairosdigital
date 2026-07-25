import Link from "next/link";
import { Plus } from "lucide-react";
import { FinanceDashboard } from "@/features/finance/components/finance-dashboard";
import { TransactionList } from "@/features/finance/components/transaction-list";

export const metadata = { title: "Finanças — Kairos" };

export default function FinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finanças</h1>
          <p className="text-muted-foreground text-sm">Visão geral financeira da igreja</p>
        </div>
        <Link href="/finance/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Link>
      </div>

      <FinanceDashboard month={currentMonth} />

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Histórico de Transações</h2>
        <TransactionList />
      </div>
    </div>
  );
}
