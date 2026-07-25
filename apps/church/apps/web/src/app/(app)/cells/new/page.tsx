import { CellForm } from "@/features/cells/components/cell-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Nova Célula — Kairos" };

export default function NewCellPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/cells" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Célula</h1>
          <p className="text-muted-foreground text-sm">Crie um novo grupo de célula</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <CellForm />
      </div>
    </div>
  );
}
