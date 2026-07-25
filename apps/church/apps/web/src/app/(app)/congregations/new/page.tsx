"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCongregationSchema, type CreateCongregationForm } from "@kairos/congregations";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewCongregationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCongregationForm>({
    resolver: zodResolver(createCongregationSchema),
  });

  const onSubmit = async (data: CreateCongregationForm) => {
    setLoading(true);

    try {
      const res = await fetch("/api/congregations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          pastorName: data.pastorName,
          pastorEmail: data.pastorEmail || null,
          pastorPhone: data.pastorPhone || null,
          patrimonio: data.patrimonio || null,
          address: data.address || null,
        }),
      });

      const result = await res.json();
      if (result.error) {
        toast.error(result.error.message || "Erro ao salvar");
        setLoading(false);
        return;
      }

      toast.success("Congregação criada!");
      router.push("/congregations");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link href="/congregations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Nova Congregação</h1>
        <p className="text-muted-foreground">Cadastre uma nova congregação vinculada à sua igreja</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Congregação *</label>
          <input {...register("name")} className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Congregação Central" />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Pastor *</label>
            <input {...register("pastorName")} className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Pr. João Silva" />
            {errors.pastorName && <p className="text-destructive text-xs mt-1">{errors.pastorName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone do Pastor</label>
            <input {...register("pastorPhone")} className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="(11) 99999-0001" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email do Pastor</label>
          <input {...register("pastorEmail")} type="email" className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="pastor@igreja.com" />
          {errors.pastorEmail && <p className="text-destructive text-xs mt-1">{errors.pastorEmail.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input {...register("address")} className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Rua da Igreja, 100 — Centro" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Patrimônio</label>
          <textarea {...register("patrimonio")} rows={3} className="w-full px-3 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Descreva o patrimônio da congregação (equipamentos, imóveis, etc.)" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Criar Congregação"}
        </button>
      </form>
    </div>
  );
}
