"use client";
// @ts-nocheck

import useSWR from "swr";
import { Card, Badge } from "@kairosdigital/ui";
import { apiFetch } from "../../../lib/api";

interface Usage {
  plan: { name: string; tier: string };
  ai: { used: number; limit: number; tokens: number };
  whatsapp: { messages: number; instances: number; instancesLimit: number };
}

export default function SettingsPage() {
  const { data } = useSWR("/usage", async (url: string) => { const r = await apiFetch<any>(url); return r; });
  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-semibold">Configurações & Consumo</h1>
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-xs text-slate-500">Plano atual</p>
            <p className="text-2xl font-semibold">{data.plan.name}</p>
            <Badge tone="purple" className="mt-2">{data.plan.tier}</Badge>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Mensagens IA (período)</p>
            <p className="text-2xl font-semibold">
              {data.ai.used} <span className="text-base text-slate-500">/ {data.ai.limit}</span>
            </p>
            <p className="text-xs text-slate-500">{data.ai.tokens.toLocaleString("pt-BR")} tokens</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">WhatsApp — instâncias</p>
            <p className="text-2xl font-semibold">
              {data.whatsapp.instances} <span className="text-base text-slate-500">/ {data.whatsapp.instancesLimit}</span>
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">WhatsApp — mensagens</p>
            <p className="text-2xl font-semibold">{data.whatsapp.messages.toLocaleString("pt-BR")}</p>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Carregando…</p>
      )}
    </div>
  );
}
