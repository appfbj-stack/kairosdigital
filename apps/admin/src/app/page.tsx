"use client";

import useSWR from "swr";
import { apiFetch } from "../lib/api";

interface Metrics {
  tenants: number;
  users: number;
  contacts: number;
  messages: number;
  aiMessages: number;
  whatsappInstances: number;
}

export default function DashboardPage() {
  const { data } = useSWR("/admin/metrics", async (url: string) => {
    const res = await apiFetch<any>(url);
    return res as Metrics;
  });

  const cards = [
    { label: "Tenants", value: data?.tenants },
    { label: "Usuários", value: data?.users },
    { label: "Contatos", value: data?.contacts },
    { label: "Mensagens", value: data?.messages },
    { label: "Mensagens IA", value: data?.aiMessages },
    { label: "Instâncias WhatsApp", value: data?.whatsappInstances },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kairos Digital — Super Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-semibold">{c.value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
