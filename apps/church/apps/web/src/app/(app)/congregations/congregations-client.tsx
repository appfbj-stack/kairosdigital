"use client";

import { useState } from "react";
import { Plus, Search, Building, User, Phone, Mail, MapPin, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { Congregation } from "@kairos/congregations";

export function CongregationsClient({ congregations: initial }: { congregations: Congregation[] }) {
  const [search, setSearch] = useState("");
  const [congregations] = useState(initial);

  const filtered = congregations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.pastorName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Congregações</h1>
          <p className="text-muted-foreground">
            {congregations.length} congregação{congregations.length !== 1 ? "ões" : ""}
          </p>
        </div>
        <Link
          href="/congregations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Nova Congregação
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar congregações..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {congregations.length === 0 ? "Nenhuma congregação cadastrada" : "Nenhum resultado"}
          </h3>
          <p className="text-sm text-muted-foreground">Adicione sua primeira congregação</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "active" ? "bg-green-500/20 text-green-600" : "bg-gray-500/20 text-gray-500"}`}>
                  {c.status === "active" ? "Ativa" : "Inativa"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium text-card-foreground">{c.pastorName}</span>
                </div>
                {c.pastorEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{c.pastorEmail}</span>
                  </div>
                )}
                {c.pastorPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{c.pastorPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-card-foreground">{c.memberCount ?? 0}</span>
                  <span>membros</span>
                </div>
                {c.patrimonio && (
                  <p className="text-xs mt-2 bg-muted p-2 rounded">
                    <strong>Patrimônio:</strong> {c.patrimonio}
                  </p>
                )}
                {c.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{c.address}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-3 pt-3 border-t">
                <Link
                  href={`/congregations/${c.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
