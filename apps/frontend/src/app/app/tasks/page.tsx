"use client";
// @ts-nocheck

import useSWR from "swr";
import { Card, Badge } from "@kairosdigital/ui";
import { apiFetch } from "../../../lib/api";

interface TaskItem {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt?: string | null;
}

const toneByPriority = { LOW: "neutral", MEDIUM: "blue", HIGH: "yellow", URGENT: "red" } as const;

export default function TasksPage() {
  const { data } = useSWR("/tasks", async (url: string) => { const r = await apiFetch<any>(url); return r; });
  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-semibold">Tarefas</h1>
      <div className="flex flex-col gap-2">
        {data?.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-slate-500">{t.dueAt ? new Date(t.dueAt).toLocaleString("pt-BR") : "sem prazo"}</p>
            </div>
            <div className="flex gap-2">
              <Badge tone={toneByPriority[t.priority]}>{t.priority}</Badge>
              <Badge>{t.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
