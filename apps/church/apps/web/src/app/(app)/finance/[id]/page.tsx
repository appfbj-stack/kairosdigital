import { redirect } from "next/navigation";

// Finance doesn't have a standalone detail view — redirect to edit
export default async function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/finance/${id}/edit`);
}
