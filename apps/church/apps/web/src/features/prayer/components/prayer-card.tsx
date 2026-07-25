"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, User } from "lucide-react";
import { formatDate } from "@kairos/utils";
import { useUpdatePrayerStatus, useDeletePrayer } from "../hooks/use-prayer";
import { toast } from "sonner";

const STATUS_CONFIG = {
  open: { label: "Aberto", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  answered: { label: "Respondido", color: "bg-green-500/20 text-green-600 dark:text-green-400" },
  closed: { label: "Encerrado", color: "bg-gray-500/20 text-gray-500" },
};

interface PrayerCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    is_anonymous: boolean;
    created_at: string;
    requester?: { name: string; avatar_url?: string | null } | null;
  };
  canManage?: boolean;
  canDelete?: boolean;
}

export function PrayerCard({ request, canManage = false, canDelete = false }: PrayerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdatePrayerStatus();
  const deletePrayer = useDeletePrayer();
  const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;

  const handleStatus = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: request.id, status: newStatus });
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remover este pedido de oração?")) return;
    try {
      await deletePrayer.mutateAsync(request.id);
      toast.success("Pedido removido");
    } catch {
      toast.error("Erro ao remover pedido");
    }
  };

  const isLong = request.description.length > 150;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            {request.is_anonymous ? (
              <User className="w-4 h-4 text-primary" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {request.requester?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {request.is_anonymous ? "Anônimo" : (request.requester?.name ?? "Membro")}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-sm">{request.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isLong && !expanded ? `${request.description.slice(0, 150)}...` : request.description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary mt-1 hover:underline"
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>

      {(canManage || canDelete) && (
        <div className="flex items-center gap-2 pt-1">
          {canManage && request.status === "open" && (
            <>
              <button
                onClick={() => handleStatus("answered")}
                disabled={updateStatus.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Respondido
              </button>
              <button
                onClick={() => handleStatus("closed")}
                disabled={updateStatus.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-500 text-xs font-medium hover:bg-gray-500/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Encerrar
              </button>
            </>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deletePrayer.isPending}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          )}
        </div>
      )}
    </div>
  );
}
