"use client";

import useSWR from "swr";
import { Card } from "@kairosdigital/ui";
import { apiFetch } from "../../../lib/api";

interface AppointmentItem {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string | null;
}

export default function CalendarPage() {
  const { data, isLoading } = useSWR("/appointments", async (url: string) => { const r = await apiFetch<any>(url); return r; });
  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-semibold">Agenda</h1>
      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : data?.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">Nenhum agendamento ainda.</p>
          <p className="text-xs text-slate-600 mt-1">Os compromissos aparecerão aqui quando criados no chat.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data?.map((a) => (
            <Card key={a.id}>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-slate-500">
                {new Date(a.startAt).toLocaleString("pt-BR")} → {new Date(a.endAt).toLocaleString("pt-BR")}
              </p>
              {a.location && <p className="text-xs text-slate-400">📍 {a.location}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
