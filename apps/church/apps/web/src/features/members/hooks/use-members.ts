"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@kairos/types";

type Member = Database["public"]["Tables"]["members"]["Row"];
type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];

export function useMembers(filter?: { status?: string; search?: string }) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["members", filter],
    queryFn: async (): Promise<Member[]> => {
      let query = supabase.from("members").select("*").order("name");

      if (filter?.status && filter.status !== "all") {
        query = query.eq("status", filter.status);
      }
      if (filter?.search) {
        query = query.ilike("name", `%${filter.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMember(id: string) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["member", id],
    queryFn: async (): Promise<Member | null> => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMember() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<MemberInsert, "church_id" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("members")
        .insert({ ...input, church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: MemberUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("members").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      void queryClient.invalidateQueries({ queryKey: ["member", data.id] });
    },
  });
}

export function useDeleteMember() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}
