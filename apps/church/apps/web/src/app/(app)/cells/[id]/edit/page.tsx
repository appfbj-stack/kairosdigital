import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CellForm } from "@/features/cells/components/cell-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCellPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: cell } = await supabase.from("cells").select("*").eq("id", id).single();

  if (!cell) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/cells/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Célula</h1>
          <p className="text-muted-foreground text-sm">{cell.name}</p>
        </div>
      </div>
      <CellForm cell={cell} />
    </div>
  );
}
