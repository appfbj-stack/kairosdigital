"use client";

import useSWR from "swr";
import { Card, Badge, Button } from "@hermes/ui";
import { apiFetch } from "../../lib/api";

interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "ARCHIVED";
  createdAt: string;
  subscription?: { plan: { name: string; tier: string } };
  _count: { users: number; contacts: number; whatsappInstances: number };
}

const toneByStatus = { ACTIVE: "green", SUSPENDED: "red", PENDING: "yellow", ARCHIVED: "neutral" } as const;

export default function TenantsPage() {
  const { data, mutate } = useSWR("/admin/tenants", async (url: string) => { const r = await apiFetch<any>(url); return r; });

  async function toggle(id: string, current: string) {
    const next = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await apiFetch(`/admin/tenants/${id}/status`, { method: "POST", body: JSON.stringify({ status: next }) });
    mutate();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tenants</h1>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((t) => (
          <Card key={t.id} className="bg-slate-900 ring-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{t.name}</h3>
                <p className="text-xs text-slate-400">/{t.slug}</p>
              </div>
              <Badge tone={toneByStatus[t.status]}>{t.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400">Plano: {t.subscription?.plan.name ?? "—"}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div><p className="font-semibold">{t._count.users}</p><p className="text-slate-500">users</p></div>
              <div><p className="font-semibold">{t._count.contacts}</p><p className="text-slate-500">contatos</p></div>
              <div><p className="font-semibold">{t._count.whatsappInstances}</p><p className="text-slate-500">WA</p></div>
            </div>
            <div className="mt-4">
              <Button size="sm" variant={t.status === "ACTIVE" ? "danger" : "primary"} onClick={() => toggle(t.id, t.status)}>
                {t.status === "ACTIVE" ? "Suspender" : "Ativar"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
