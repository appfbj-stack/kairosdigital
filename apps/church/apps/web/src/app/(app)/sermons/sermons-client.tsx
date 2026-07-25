"use client";

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { SermonCard } from "@/features/sermons/components/sermon-card";

interface Sermon {
  id: string;
  title: string;
  series?: string | null;
  scripture?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  pdf_url?: string | null;
  preached_at: string;
  pastor?: { name: string; avatar_url?: string | null } | null;
}

export function SermonsClient({ sermons }: { sermons: Sermon[] }) {
  const [search, setSearch] = useState("");

  const filtered = sermons.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.series?.toLowerCase().includes(search.toLowerCase()) ||
      s.pastor?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sermões</h1>
          <p className="text-muted-foreground text-sm">{sermons.length} sermões</p>
        </div>
        <Link
          href="/sermons/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Sermão
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar sermão, série ou pastor..."
        className="w-full max-w-sm px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {search ? "Nenhum sermão encontrado" : "Nenhum sermão cadastrado"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {search ? "Tente buscar com outros termos" : "Cadastre o primeiro sermão da sua igreja"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      )}
    </div>
  );
}
