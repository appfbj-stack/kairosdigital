"use client";

import { useState } from "react";
import { Plus, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrayerCard } from "@/features/prayer/components/prayer-card";

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "answered", label: "Respondidos" },
  { value: "closed", label: "Encerrados" },
];

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  requester?: { name: string; avatar_url?: string | null } | null;
}

export function PrayerClient({ requests }: { requests: PrayerRequest[] }) {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos de Oração</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} pedidos</p>
        </div>
        <Link
          href="/prayer/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum pedido encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Compartilhe seus pedidos de oração com a comunidade
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((request) => (
            <div key={request.id} onClick={() => router.push(`/prayer/${request.id}`)} className="cursor-pointer">
              <PrayerCard request={request} canManage canDelete />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
