"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function useEvents(upcoming = false) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["events", { upcoming }],
    queryFn: async () => {
      let query = supabase.from("events").select("*").order("start_at", { ascending: true });
      if (upcoming) query = query.gte("start_at", new Date().toISOString());
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEvent(id: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string; description?: string; start_at: string;
      end_at?: string; location?: string; type: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...input,
          description: input.description || null,
          end_at: input.end_at || null,
          location: input.location || null,
          church_id: profile.church_id,
          created_by: user.id,
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string; title: string; description?: string;
      start_at: string; end_at?: string; location?: string; type: string;
    }) => {
      const { data, error } = await supabase
        .from("events")
        .update({ ...input, description: input.description || null, end_at: input.end_at || null, location: input.location || null })
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
  });
}

export function useDeleteEvent() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}
