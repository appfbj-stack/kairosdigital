"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function useCells() {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["cells"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cells")
        .select(`*, leader:members!leader_id(name)`)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCell(id: string) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["cell", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cells")
        .select(`*, leader:members!leader_id(name)`)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCell() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string; leader_id: string;
      meeting_day: string; meeting_time: string; address?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("cells")
        .insert({ ...input, church_id: profile.church_id, created_by: user.id, active: true })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cells"] }),
  });
}

export function useUpdateCell() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from("cells").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["cells"] });
      void queryClient.invalidateQueries({ queryKey: ["cell", data.id] });
    },
  });
}

export function useDeleteCell() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cells").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cells"] }),
  });
}

export function useLeaders() {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["leaders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
