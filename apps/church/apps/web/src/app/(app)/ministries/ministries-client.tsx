"use client";

import { useState } from "react";
import { Plus, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteMinistry } from "@/features/ministries/hooks/use-ministries";

interface Ministry {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  leader?: { name: string } | null;
}

export function MinistriesClient({ ministries: initial }: { ministries: Ministry[] }) {
  const [ministries, setMinistries] = useState(initial);
  const deleteMinistry = useDeleteMinistry();
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o ministério "${name}"?`)) return;
    try {
      await deleteMinistry.mutateAsync(id);
      setMinistries((prev) => prev.filter((m) => m.id !== id));
      toast.success("Ministério excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ministérios</h1>
          <p className="text-muted-foreground text-sm">{ministries.length} ministérios</p>
        </div>
        <Link
          href="/ministries/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Ministério
        </Link>
      </div>

      {ministries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum ministério cadastrado</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Crie o primeiro ministério da sua igreja
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              onClick={() => router.push(`/ministries/${ministry.id}`)}
              className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors relative group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: ministry.color ?? "#7C3AED" }}
                >
                  {ministry.name[0].toUpperCase()}
                </div>
                <button
                  onClick={() => handleDelete(ministry.id, ministry.name)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold">{ministry.name}</h3>
              {ministry.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ministry.description}</p>
              )}
              {ministry.leader && (
                <p className="text-xs text-muted-foreground mt-2">
                  Líder: <span className="font-medium text-foreground">{ministry.leader.name}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
