"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { FinanceSummary } from "@kairos/finance/types";

export function useTransactions(filters?: { type?: string; month?: string }) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*, member:members(name)")
        .order("date", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.month) {
        const [year, month] = filters.month.split("-");
        if (year && month) {
          const start = `${year}-${month}-01`;
          const end = `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;
          query = query.gte("date", start).lt("date", end);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFinanceSummary(month?: string) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["finance-summary", month],
    queryFn: async (): Promise<FinanceSummary> => {
      let query = supabase.from("transactions").select("type, amount, category");

      if (month) {
        const [year, m] = month.split("-");
        if (year && m) {
          const start = `${year}-${m}-01`;
          const end = `${year}-${String(Number(m) + 1).padStart(2, "0")}-01`;
          query = query.gte("date", start).lt("date", end);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const transactions = data ?? [];
      const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      const byCategory: Record<string, number> = {};
      transactions.forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
      });

      return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, byCategory };
    },
  });
}

export function useCreateTransaction() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      type: "income" | "expense"; category: string; amount: number;
      description?: string; date: string; member_id?: string;
      payment_method: "pix" | "cash" | "transfer" | "card";
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...input,
          member_id: input.member_id || null,
          description: input.description || null,
          church_id: profile.church_id,
          created_by: user.id,
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useUpdateTransaction() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string;
      type?: "income" | "expense"; category?: string; amount?: number;
      description?: string; date?: string; member_id?: string | null;
      payment_method?: "pix" | "cash" | "transfer" | "card";
    }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({ ...input, member_id: input.member_id ?? null })
        .eq("id", id)
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useTransaction(id: string) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteTransaction() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}
