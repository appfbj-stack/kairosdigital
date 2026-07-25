import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, CircleDot, MapPin, Clock, User } from "lucide-react";

export const metadata = { title: "Células — Kairos" };

export default async function CellsPage() {
  const supabase = await createServerClient();

  const { data: cells } = await supabase
    .from("cells")
    .select(`*, leader:members!leader_id(name)`)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Células</h1>
          <p className="text-muted-foreground text-sm">{cells?.length ?? 0} células ativas</p>
        </div>
        <Link href="/cells/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Nova Célula
        </Link>
      </div>

      {!cells || cells.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <CircleDot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma célula cadastrada</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Crie a primeira célula da sua igreja para começar a organizar os grupos.
          </p>
          <Link href="/cells/new" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Criar primeira célula
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cells.map((cell) => {
            const leader = Array.isArray(cell.leader) ? cell.leader[0] : cell.leader;
            return (
              <Link key={cell.id} href={`/cells/${cell.id}`} className="bg-card border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{cell.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cell.active ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
                    {cell.active ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>{leader?.name ?? "Sem líder"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{cell.meeting_day} às {cell.meeting_time}</span>
                  </div>
                  {cell.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cell.address}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
