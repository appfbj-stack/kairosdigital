"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateVolunteer, useUpdateVolunteer, VOLUNTEER_ROLES, AVAILABILITY_OPTIONS } from "../hooks/use-volunteers";

interface VolunteerFormProps {
  volunteer?: {
    id: string;
    member_id: string;
    role: string;
    ministry_id?: string | null;
    availability?: string[];
    notes?: string | null;
    active?: boolean;
  };
  members: { id: string; name: string }[];
  ministries: { id: string; name: string; color?: string | null }[];
}

export function VolunteerForm({ volunteer, members, ministries }: VolunteerFormProps) {
  const router = useRouter();
  const createVolunteer = useCreateVolunteer();
  const updateVolunteer = useUpdateVolunteer();
  const isEditing = !!volunteer;

  const [memberId, setMemberId] = useState(volunteer?.member_id ?? "");
  const [role, setRole] = useState(volunteer?.role ?? "");
  const [customRole, setCustomRole] = useState(
    volunteer?.role && !VOLUNTEER_ROLES.includes(volunteer.role) ? volunteer.role : ""
  );
  const [ministryId, setMinistryId] = useState(volunteer?.ministry_id ?? "");
  const [availability, setAvailability] = useState<string[]>(volunteer?.availability ?? []);
  const [notes, setNotes] = useState(volunteer?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAvail = (val: string) => {
    setAvailability((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const finalRole = role === "Outro" ? customRole : role;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !finalRole) {
      toast.error("Selecione um membro e informe a função");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        member_id: memberId,
        role: finalRole,
        ministry_id: ministryId || undefined,
        availability,
        notes: notes || undefined,
      };

      if (isEditing) {
        await updateVolunteer.mutateAsync({ id: volunteer.id, ...payload, ministry_id: payload.ministry_id ?? null });
        toast.success("Voluntário atualizado!");
      } else {
        const created = await createVolunteer.mutateAsync(payload);
        toast.success("Voluntário cadastrado!");
        router.push(`/volunteers/${created.id}`);
        return;
      }
      router.push("/volunteers");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(msg.includes("unique") ? "Este membro já tem essa função cadastrada" : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-lg">
      {/* Membro */}
      <div>
        <label className="block text-sm font-medium mb-1">Membro *</label>
        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          disabled={isEditing}
          className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        >
          <option value="">Selecione um membro…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Função */}
      <div>
        <label className="block text-sm font-medium mb-1">Função *</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Selecione uma função…</option>
          {VOLUNTEER_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {role === "Outro" && (
          <input
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="Descreva a função…"
            className="mt-2 w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Ministério */}
      {ministries.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Ministério</label>
          <select
            value={ministryId}
            onChange={(e) => setMinistryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Nenhum</option>
            {ministries.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Disponibilidade */}
      <div>
        <label className="block text-sm font-medium mb-2">Disponibilidade</label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                availability.includes(opt.value)
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-input hover:bg-muted"
              }`}
            >
              <input
                type="checkbox"
                checked={availability.includes(opt.value)}
                onChange={() => toggleAvail(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Informações adicionais…"
          className="w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/volunteers")}
          className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Salvando…" : isEditing ? "Atualizar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
