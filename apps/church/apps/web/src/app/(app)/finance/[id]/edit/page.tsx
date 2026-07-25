import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TransactionForm } from "@/features/finance/components/transaction-form";

export const metadata = { title: "Editar Transação — Kairos" };

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (!transaction) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Transação</h1>
          <p className="text-muted-foreground text-sm">{transaction.category} — {transaction.date}</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <TransactionForm transaction={transaction} />
      </div>
    </div>
  );
}
