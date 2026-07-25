"use client";
// @ts-nocheck

import { useEffect, useState, useCallback } from "react";
import { Button, Card, Input, Badge } from "@hermes/ui";
import { apiFetch } from "../../../lib/api";

// ── Types ────────────────────────────────────────────────────────────

interface ContactBrief {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags: string[];
}

interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  color?: string | null;
  probability?: number | null;
  createdAt: string;
  updatedAt: string;
  contacts: ContactBrief[];
}

interface PipelineData {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  stages: Stage[];
  _count?: { contacts: number };
}

// ── Helpers ──────────────────────────────────────────────────────────

function tagTone(tag: string): "neutral" | "green" | "red" | "yellow" | "blue" | "purple" {
  const t = tag.toLowerCase();
  if (t.includes("vip") || t.includes("premium")) return "purple";
  if (t.includes("quente") || t.includes("hot") || t.includes("urgente")) return "red";
  if (t.includes("frio") || t.includes("cold")) return "neutral";
  if (t.includes("ganho") || t.includes("fechado") || t.includes("won")) return "green";
  if (t.includes("perdido") || t.includes("lost")) return "red";
  if (t.includes("proposta") || t.includes("proposal")) return "yellow";
  if (t.includes("lead") || t.includes("qualif")) return "blue";
  return "blue";
}

// ── Page ─────────────────────────────────────────────────────────────

export default function PipelinePage() {
  // pipeline list
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // selected pipeline + detail
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ stages: Stage[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // create pipeline
  const [creating, setCreating] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newPipelineDesc, setNewPipelineDesc] = useState("");
  const [creatingSaving, setCreatingSaving] = useState(false);

  // add stage
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  // context menu per contact (which contact card's dropdown is open)
  const [menuContactId, setMenuContactId] = useState<string | null>(null);

  // moving contact
  const [moving, setMoving] = useState(false);

  // ── Fetch pipelines ──────────────────────────────────────────────
  const fetchPipelines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Pipeline[]>("/pipelines");
      setPipelines(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar pipelines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  // ── Fetch pipeline detail when selectedId changes ────────────────
  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    apiFetch<{ stages: Stage[] }>(`/pipelines/${selectedId}`)
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  // ── Create pipeline ──────────────────────────────────────────────
  async function handleCreate() {
    if (!newPipelineName.trim()) return;
    setCreatingSaving(true);
    try {
      const created = await apiFetch<Pipeline>("/pipelines", {
        method: "POST",
        body: JSON.stringify({
          name: newPipelineName.trim(),
          description: newPipelineDesc.trim() || undefined,
        }),
      });
      setPipelines((prev) => [...prev, created]);
      setSelectedId(created.id);
      setCreating(false);
      setNewPipelineName("");
      setNewPipelineDesc("");
    } catch (err: any) {
      alert(err.message ?? "Erro ao criar pipeline");
    } finally {
      setCreatingSaving(false);
    }
  }

  // ── Add stage ────────────────────────────────────────────────────
  async function handleAddStage() {
    if (!selectedId || !newStageName.trim()) return;
    try {
      await apiFetch<Stage>(`/pipelines/${selectedId}/stages`, {
        method: "POST",
        body: JSON.stringify({ name: newStageName.trim() }),
      });
      // refresh detail
      const updated = await apiFetch<{ stages: Stage[] }>(`/pipelines/${selectedId}`);
      setDetail(updated);
      setAddingStage(false);
      setNewStageName("");
    } catch (err: any) {
      alert(err.message ?? "Erro ao adicionar estágio");
    }
  }

  // ── Move contact ─────────────────────────────────────────────────
  async function handleMoveContact(contactId: string, stageId: string) {
    if (!selectedId) return;
    setMoving(true);
    setMenuContactId(null);
    try {
      await apiFetch(`/pipelines/${selectedId}/move-contact`, {
        method: "PATCH",
        body: JSON.stringify({ contactId, stageId }),
      });
      // refresh detail
      const updated = await apiFetch<{ stages: Stage[] }>(`/pipelines/${selectedId}`);
      setDetail(updated);
    } catch (err: any) {
      alert(err.message ?? "Erro ao mover contato");
    } finally {
      setMoving(false);
    }
  }

  // ── Delete pipeline ──────────────────────────────────────────────
  async function handleDeletePipeline() {
    if (!selectedId) return;
    if (!confirm("Tem certeza que deseja excluir este pipeline? Esta ação não pode ser desfeita.")) return;
    try {
      await apiFetch(`/pipelines/${selectedId}`, { method: "DELETE" });
      const remaining = pipelines.filter((p) => p.id !== selectedId);
      setPipelines(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setDetail(null);
    } catch (err: any) {
      alert(err.message ?? "Erro ao excluir pipeline");
    }
  }

  // ── Delete stage ─────────────────────────────────────────────────
  async function handleDeleteStage(stageId: string, stageName: string) {
    if (!selectedId) return;
    if (!confirm(`Excluir estágio "${stageName}"? Contatos neste estágio permanecerão no sistema.`)) return;
    try {
      await apiFetch(`/pipelines/${selectedId}/stages/${stageId}`, { method: "DELETE" });
      const updated = await apiFetch<{ stages: Stage[] }>(`/pipelines/${selectedId}`);
      setDetail(updated);
    } catch (err: any) {
      alert(err.message ?? "Erro ao excluir estágio");
    }
  }

  const stages = detail?.stages ?? [];
  const pipeline = pipelines.find((p) => p.id === selectedId);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold">Pipeline Kanban</h1>
        <div className="flex items-center gap-2">
          {/* Pipeline selector */}
          {!loading && pipelines.length > 0 && (
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p._count?.contacts ?? 0} contatos)
                </option>
              ))}
            </select>
          )}
          {selectedId && (
            <Button variant="ghost" size="sm" onClick={() => setAddingStage(true)}>
              + Adicionar estágio
            </Button>
          )}
          <Button size="sm" onClick={() => setCreating(true)}>
            + Novo pipeline
          </Button>
          {selectedId && pipelines.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleDeletePipeline}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </Button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Loading state ─────────────────────────────────────── */}
        {loading && (
          <div className="flex w-full items-center justify-center p-12">
            <p className="text-sm text-slate-500">Carregando pipelines…</p>
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-12">
            <p className="text-sm text-red-500">{error}</p>
            <Button variant="outline" onClick={fetchPipelines}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* ── Empty state: no pipelines ────────────────────────── */}
        {!loading && !error && pipelines.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-12">
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Nenhum pipeline encontrado
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Crie seu primeiro pipeline para começar a organizar seus contatos em estágios.
              </p>
            </div>
            <Button onClick={() => setCreating(true)}>+ Criar pipeline</Button>
          </div>
        )}

        {/* ── Empty state: pipeline with no stages ──────────────── */}
        {!loading && !error && selectedId && !detailLoading && stages.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-12">
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Nenhum estágio neste pipeline
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Adicione um estágio para começar a organizar o fluxo.
              </p>
            </div>
            <Button onClick={() => setAddingStage(true)}>+ Adicionar estágio</Button>
          </div>
        )}

        {/* ── Kanban board ─────────────────────────────────────── */}
        {!loading && !error && selectedId && stages.length > 0 && (
          <div className="flex w-full gap-4 overflow-x-auto p-6">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Stage header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Color dot */}
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color ?? "#94a3b8" }}
                    />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {stage.name}
                    </h3>
                    <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      {stage.contacts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteStage(stage.id, stage.name)}
                    className="rounded p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Excluir estágio"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Contacts */}
                {detailLoading ? (
                  <div className="p-4 text-center text-xs text-slate-400">Carregando…</div>
                ) : stage.contacts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum contato neste estágio
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 overflow-y-auto p-2">
                    {stage.contacts.map((contact) => (
                      <div key={contact.id} className="relative">
                        <Card className="!p-3 text-sm">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                                {contact.name}
                              </p>
                              {contact.email && (
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {contact.email}
                                </p>
                              )}
                              {contact.company && (
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                  {contact.company}
                                </p>
                              )}
                              {contact.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {contact.tags.map((tag) => (
                                    <Badge key={tag} tone={tagTone(tag)}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Move button / dropdown */}
                            <div className="relative ml-1 shrink-0">
                              <button
                                onClick={() =>
                                  setMenuContactId(menuContactId === contact.id ? null : contact.id)
                                }
                                className="rounded p-0.5 text-slate-400 hover:text-indigo-500 transition-colors"
                                title="Mover contato"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                              </button>

                              {/* Dropdown */}
                              {menuContactId === contact.id && (
                                <>
                                  {/* Backdrop to close */}
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuContactId(null)}
                                  />
                                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                    <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Mover para
                                    </p>
                                    {stages
                                      .filter((s) => s.id !== stage.id)
                                      .map((s) => (
                                        <button
                                          key={s.id}
                                          disabled={moving}
                                          onClick={() => handleMoveContact(contact.id, s.id)}
                                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                          <span
                                            className="inline-block h-2 w-2 rounded-full shrink-0"
                                            style={{ backgroundColor: s.color ?? "#94a3b8" }}
                                          />
                                          {s.name}
                                        </button>
                                      ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}

                {/* Probability bar at bottom */}
                {stage.probability != null && stage.probability > 0 && (
                  <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-400 dark:border-slate-800">
                    Probabilidade: {stage.probability}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Detail loading overlay for the board ─────────────── */}
        {!loading && !error && selectedId && detailLoading && stages.length === 0 && (
          <div className="flex w-full items-center justify-center p-12">
            <p className="text-sm text-slate-500">Carregando estágios…</p>
          </div>
        )}
      </div>

      {/* ── Modal: Create pipeline ─────────────────────────────── */}
      {creating && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setCreating(false)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md !p-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Novo pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Crie um pipeline com 4 estágios padrão: Lead, Qualificado, Proposta e Fechado.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Input
                  label="Nome"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  placeholder="Ex: Vendas 2026"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <Input
                  label="Descrição (opcional)"
                  value={newPipelineDesc}
                  onChange={(e) => setNewPipelineDesc(e.target.value)}
                  placeholder="Breve descrição do pipeline"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} loading={creatingSaving} disabled={!newPipelineName.trim()}>
                  Criar pipeline
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ── Modal: Add stage ────────────────────────────────────── */}
      {addingStage && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setAddingStage(false)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm !p-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Adicionar estágio
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pipeline: {pipeline?.name}
              </p>
              <div className="mt-4">
                <Input
                  label="Nome do estágio"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Ex: Follow-up"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAddingStage(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
                  Adicionar
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );

}
