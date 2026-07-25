"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function usePrayerRequests(status?: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["prayer_requests", { status }],
    queryFn: async () => {
      let query = supabase
        .from("prayer_requests")
        .select("*, requester:users!created_by(name, avatar_url)")
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePrayerRequest(id: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["prayer_request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*, requester:users!created_by(name, avatar_url)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePrayer() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      is_anonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();
      if (profileError || !profile) throw new Error("Perfil não encontrado. Faça logout e entre novamente.");
      if (!profile.church_id) throw new Error("Igreja não configurada no perfil. Entre em contato com o suporte.");
      const { data, error } = await supabase
        .from("prayer_requests")
        .insert({
          title: input.title,
          description: input.description,
          is_anonymous: input.is_anonymous ?? false,
          church_id: profile.church_id,
          created_by: user.id,
          status: "open",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["prayer_requests"] }),
  });
}

export function useUpdatePrayerStatus() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("prayer_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["prayer_requests"] }),
  });
}

export function useDeletePrayer() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["prayer_requests"] }),
  });
}
