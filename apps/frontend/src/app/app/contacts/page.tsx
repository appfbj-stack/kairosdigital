"use client";
// @ts-nocheck

import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { Button, Card, Input, Badge } from "@hermes/ui";
import { apiFetch } from "../../../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PipelineStageItem {
  id: string;
  name: string;
  order: number;
  color?: string | null;
  pipelineId: string;
  pipeline?: { id: string; name: string };
}

interface ContactItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  tags: string[];
  notes?: string | null;
  source?: string | null;
  pipelineStageId?: string | null;
  pipelineStage?: PipelineStage | null;
  createdAt: string;
  updatedAt: string;
}

interface PipelineInfo {
  id: string;
  name: string;
  stages: PipelineStageItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-violet-500", "bg-cyan-500", "bg-teal-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
const fetcherContacts = (url: string) => apiFetch<{ items: Contact[]; total: number }>(url);
const fetcherPipelines = (url: string) => apiFetch<PipelineInfo[]>(url);

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <Card className="p-0">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Contato</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Tags</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhum contato</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Comece adicionando seu primeiro contato.
      </p>
      <Button className="mt-4" onClick={onNew}>
        + Novo contato
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Side Panel (Detail + Edit)
// ---------------------------------------------------------------------------
interface SidePanelProps {
  contact: Contact | null;
  pipelines: PipelineInfo[];
  mode: "detail" | "edit" | "create";
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  onEdit: () => void;
}

function SidePanel({ contact, pipelines, mode, onClose, onSaved, onDeleted, onEdit }: SidePanelProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    tags: "",
    notes: "",
    pipelineStageId: "",
  });

  // Initialize form when contact/mode changes
  useEffect(() => {
    if (contact && (mode === "edit" || mode === "detail")) {
      setForm({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        jobTitle: contact.jobTitle || "",
        tags: contact.tags?.join(", ") || "",
        notes: contact.notes || "",
        pipelineStageId: contact.pipelineStageId || "",
      });
    } else if (mode === "create") {
      setForm({ name: "", email: "", phone: "", company: "", jobTitle: "", tags: "", notes: "", pipelineStageId: "" });
    }
  }, [contact, mode]);

  // Build flat stage list from all pipelines
  const allStages = pipelines.flatMap((p) =>
    p.stages.map((s) => ({ ...s, pipeline: { id: p.id, name: p.name } }))
  );

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        jobTitle: form.jobTitle || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        notes: form.notes || undefined,
        pipelineStageId: form.pipelineStageId || undefined,
      };

      if (mode === "create") {
        await apiFetch("/contacts", { method: "POST", body: JSON.stringify(body) });
      } else if (contact) {
        await apiFetch(`/contacts/${contact.id}`, { method: "PATCH", body: JSON.stringify(body) });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!contact || !window.confirm(`Tem certeza que deseja excluir "${contact.name}"? Esta ação é irreversível.`)) return;
    await apiFetch(`/contacts/${contact.id}`, { method: "DELETE" });
    onDeleted();
  }

  const isEditing = mode === "edit" || mode === "create";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-black/30 transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {mode === "create" ? "Novo contato" : mode === "edit" ? "Editar contato" : "Detalhes do contato"}
          </h2>
          <div className="flex items-center gap-2">
            {mode === "detail" && contact && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onSaved() /* triggers mode="edit" externally */}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleDelete}>
                  Excluir
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "detail" && contact ? (
            /* ── Detail View ── */
            <div className="space-y-6">
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-3">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${avatarColor(contact.name)} text-2xl font-bold text-white shadow-lg`}>
                  {initials(contact.name)}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{contact.name}</h3>
                  {contact.jobTitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{contact.jobTitle}</p>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <Field label="E-mail" value={contact.email} />
                <Field label="Telefone" value={contact.phone} />
                <Field label="Empresa" value={contact.company} />
                <Field label="Pipeline" value={contact.pipelineStage ? `${contact.pipelineStage.pipeline?.name ?? ""} › ${contact.pipelineStage.name}` : null} />
                {contact.tags.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {contact.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Field label="Notas" value={contact.notes} />
                <Field label="Origem" value={contact.source} />
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
                <p>Criado em {formatDate(contact.createdAt)}</p>
                <p>Atualizado em {formatDate(contact.updatedAt)}</p>
              </div>
            </div>
          ) : (
            /* ── Edit / Create Form ── */
            <div className="space-y-4">
              {mode === "edit" && contact && (
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${avatarColor(contact.name)} text-xl font-bold text-white`}>
                    {initials(contact.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Editando informações</p>
                  </div>
                </div>
              )}

              <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" />
                <Input label="Cargo" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Cargo" />
              </div>
              <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, lead, cliente (separadas por vírgula)" />

              {/* Pipeline Stage Selector */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estágio do Pipeline</label>
                <select
                  value={form.pipelineStageId}
                  onChange={(e) => setForm({ ...form, pipelineStageId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
                >
                  <option value="">Nenhum</option>
                  {pipelines.map((p) => (
                    <optgroup key={p.id} label={p.name}>
                      {p.stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {allStages.length === 0 && (
                  <p className="mt-1 text-xs text-slate-400">Nenhum pipeline configurado. Configure um pipeline primeiro.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Anotações sobre este contato..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === "edit" || mode === "create") && (
          <div className="flex gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            {mode === "edit" && contact && (
              <Button variant="ghost" className="ml-auto text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleDelete}>
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Field component for detail view
// ---------------------------------------------------------------------------
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <p className="text-sm text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const { data, mutate, isLoading } = useSWR(
    `/contacts?search=${encodeURIComponent(search)}&perPage=50`,
    fetcherContacts,
  );

  // Only fetch pipelines when needed (for the side panel)
  const { data: pipelinesData } = useSWR("/pipelines", fetcherPipelines, { revalidateOnFocus: false });
  const pipelines = pipelinesData || [];

  // Side panel state
  const [panel, setPanel] = useState<{
    contact: Contact | null;
    mode: "detail" | "edit" | "create";
  } | null>(null);

  function openCreate() {
    setPanel({ contact: null, mode: "create" });
  }

  function openDetail(contact: Contact) {
    // Fetch full detail
    apiFetch<Contact>(`/contacts/${contact.id}`).then((c) => {
      setPanel({ contact: c, mode: "detail" });
    }).catch(() => {
      setPanel({ contact, mode: "detail" }); // fallback
    });
  }

  function openEdit(contact: Contact) {
    setPanel({ contact, mode: "edit" });
  }

  function closePanel() {
    setPanel(null);
  }

  function onSaved() {
    if (panel?.mode === "edit" && panel.contact) {
      // Switch back to detail with updated data
      apiFetch<Contact>(`/contacts/${panel.contact.id}`).then((c) => {
        setPanel({ contact: c, mode: "detail" });
      });
    } else {
      closePanel();
    }
    mutate();
  }

  function onDeleted() {
    closePanel();
    mutate();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contatos</h1>
        <Button onClick={openCreate}>+ Novo contato</Button>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {/* Search */}
        <Input
          placeholder="Buscar por nome, email, telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Empty */}
        {!isLoading && data && data.items.length === 0 && <EmptyState onNew={openCreate} />}

        {/* Table */}
        {!isLoading && data && data.items.length > 0 && (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Estágio</th>
                  <th className="px-4 py-3">Tags</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openDetail(c)}
                    className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-indigo-50/50 last:border-0 dark:border-slate-800 dark:hover:bg-indigo-900/10"
                  >
                    <td className="px-4 py-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${avatarColor(c.name)} text-xs font-semibold text-white`}>
                        {initials(c.name)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
                      {c.jobTitle && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">{c.jobTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {c.email && <div className="truncate max-w-[200px]">{c.email}</div>}
                      {c.phone && <div className="text-xs">{c.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.company ?? "—"}</td>
                    <td className="px-4 py-3">
                      {c.pipelineStage ? (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: c.pipelineStage.color ? `${c.pipelineStage.color}20` : undefined,
                            color: c.pipelineStage.color || undefined,
                          }}
                        >
                          {c.pipelineStage.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <Badge key={t} className="text-xs">{t}</Badge>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Side Panel */}
      {panel && (
        <SidePanel
          contact={panel.contact}
          pipelines={pipelines}
          mode={panel.mode}
          onClose={closePanel}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}
