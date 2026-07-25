import { TransactionForm } from "@/features/finance/components/transaction-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Nova Transação — Kairos" };

export default function NewTransactionPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Transação</h1>
          <p className="text-muted-foreground text-sm">Registre uma entrada ou saída</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <TransactionForm />
      </div>
    </div>
  );
}
