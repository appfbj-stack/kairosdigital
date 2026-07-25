"use client";
// @ts-nocheck

import { useState } from "react";
import useSWR from "swr";
import { Button, Card, Badge, Input } from "@kairosdigital/ui";
import { apiFetch } from "../../../lib/api";

interface Instance {
  id: string;
  name: string;
  instanceName: string;
  status: "DISCONNECTED" | "CONNECTING" | "QR_CODE" | "CONNECTED" | "ERROR";
  phoneNumber?: string | null;
  qrCode?: string | null;
}

const toneByStatus: Record<Instance["status"], "green" | "yellow" | "red" | "neutral" | "blue"> = {
  CONNECTED: "green",
  CONNECTING: "blue",
  QR_CODE: "yellow",
  DISCONNECTED: "neutral",
  ERROR: "red",
};

export default function WhatsAppPage() {
  const { data, mutate } = useSWR("/whatsapp/instances", async (url: string) => { const r = await apiFetch<any>(url); return r; });
  const [name, setName] = useState("");
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    await apiFetch("/whatsapp/instances", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    mutate();
  }

  async function showQr(id: string) {
    setQrFor(id);
    const qr = await apiFetch<{ base64?: string; code?: string }>(`/whatsapp/instances/${id}/qr`);
    setQrSrc(qr.base64 ?? qr.code ?? null);
  }

  async function remove(id: string) {
    if (!confirm("Remover instância?")) return;
    await apiFetch(`/whatsapp/instances/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold">WhatsApp</h1>
        <p className="text-xs text-slate-500">Conecte e gerencie suas instâncias</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <Card>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Nova instância" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vendas, Suporte, Bot..." />
            </div>
            <Button onClick={create}>+ Criar</Button>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((inst) => (
            <Card key={inst.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{inst.name}</h3>
                  <p className="text-xs text-slate-500">{inst.instanceName}</p>
                </div>
                <Badge tone={toneByStatus[inst.status]}>{inst.status}</Badge>
              </div>
              {inst.phoneNumber && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">📱 {inst.phoneNumber}</p>
              )}
              <div className="mt-4 flex gap-2">
                {inst.status !== "CONNECTED" && (
                  <Button size="sm" onClick={() => showQr(inst.id)}>
                    Ver QR Code
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => remove(inst.id)}>
                  Remover
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {qrFor && qrSrc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
            onClick={() => {
              setQrFor(null);
              setQrSrc(null);
            }}
          >
            <Card className="max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 font-medium">Escaneie no WhatsApp</h3>
              <img
                src={qrSrc.startsWith("data:") ? qrSrc : `data:image/png;base64,${qrSrc}`}
                alt="QR Code"
                className="w-full rounded-lg"
              />
              <p className="mt-2 text-xs text-slate-500">QR expira em ~60s. Atualize se necessário.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
