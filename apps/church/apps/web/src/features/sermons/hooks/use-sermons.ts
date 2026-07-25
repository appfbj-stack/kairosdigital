"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function useSermons(limit?: number) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["sermons", { limit }],
    queryFn: async () => {
      let query = supabase
        .from("sermons")
        .select("*, pastor:users!pastor_id(name, avatar_url)")
        .order("preached_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSermon(id: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["sermon", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*, pastor:users!pastor_id(name, avatar_url)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSermon() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      pastor_id: string;
      series?: string;
      scripture?: string;
      video_url?: string;
      audio_url?: string;
      pdf_url?: string;
      preached_at: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();
      if (!profile) throw new Error("Perfil não encontrado");
      const { data, error } = await supabase
        .from("sermons")
        .insert({
          title: input.title,
          pastor_id: input.pastor_id,
          series: input.series || null,
          scripture: input.scripture || null,
          video_url: input.video_url || null,
          audio_url: input.audio_url || null,
          pdf_url: input.pdf_url || null,
          preached_at: input.preached_at,
          church_id: profile.church_id,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sermons"] }),
  });
}

export function useUpdateSermon() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string; title: string; pastor_id: string; series?: string;
      scripture?: string; video_url?: string; audio_url?: string;
      pdf_url?: string; preached_at: string;
    }) => {
      const { data, error } = await supabase
        .from("sermons")
        .update({
          title: input.title, pastor_id: input.pastor_id,
          series: input.series || null, scripture: input.scripture || null,
          video_url: input.video_url || null, audio_url: input.audio_url || null,
          pdf_url: input.pdf_url || null, preached_at: input.preached_at,
        })
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["sermons"] });
      void queryClient.invalidateQueries({ queryKey: ["sermon", data.id] });
    },
  });
}

export function useDeleteSermon() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sermons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sermons"] }),
  });
}

export function usePastors() {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["pastors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .in("role", ["pastor", "church_admin", "super_admin"])
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
