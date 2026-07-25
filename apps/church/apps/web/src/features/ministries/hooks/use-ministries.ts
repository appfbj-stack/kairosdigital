"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function useMinistries() {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*, leader:members!leader_id(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMinistry(id: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["ministry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*, leader:members!leader_id(name, avatar_url)")
        .eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMinistry() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; leader_id?: string; color: string; icon: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");
      const { data, error } = await supabase
        .from("ministries")
        .insert({ ...input, leader_id: input.leader_id || null, church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ministries"] }),
  });
}

export function useUpdateMinistry() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; [k: string]: unknown }) => {
      const { data, error } = await supabase.from("ministries").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["ministries"] });
      void queryClient.invalidateQueries({ queryKey: ["ministry", data.id] });
    },
  });
}

export function useAddMinistryMember() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ministry_id, member_id, role = "membro" }: { ministry_id: string; member_id: string; role?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");
      const { data, error } = await supabase
        .from("ministry_members")
        .insert({ ministry_id, member_id, role, church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["ministry_members", vars.ministry_id] });
    },
  });
}

export function useRemoveMinistryMember() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ministry_id }: { id: string; ministry_id: string }) => {
      const { error } = await supabase.from("ministry_members").delete().eq("id", id);
      if (error) throw error;
      return ministry_id;
    },
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["ministry_members", vars.ministry_id] });
    },
  });
}

export function useDeleteMinistry() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ministries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ministries"] }),
  });
}
