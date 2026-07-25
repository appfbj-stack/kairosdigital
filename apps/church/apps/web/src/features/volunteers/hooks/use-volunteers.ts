"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export const AVAILABILITY_OPTIONS = [
  { value: "domingo_manha", label: "Domingo — manhã" },
  { value: "domingo_tarde", label: "Domingo — tarde" },
  { value: "domingo_noite", label: "Domingo — noite" },
  { value: "quarta_noite", label: "Quarta — noite" },
  { value: "sexta_noite", label: "Sexta — noite" },
  { value: "sabado_manha", label: "Sábado — manhã" },
  { value: "sabado_noite", label: "Sábado — noite" },
];

export const VOLUNTEER_ROLES = [
  "Líder de Louvor", "Músico", "Cantor", "Técnico de Som", "Técnico de Mídia",
  "Recepção", "Segurança", "Intercessão", "Infantil", "Jovens",
  "Transmissão Online", "Fotografia", "Diaconia", "Outro",
];

export function useVolunteers(filters?: { active?: boolean; ministryId?: string }) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["volunteers", filters],
    queryFn: async () => {
      let query = supabase
        .from("volunteers")
        .select("*, member:members!member_id(id, name, avatar_url, phone, email), ministry:ministries!ministry_id(id, name, color)")
        .order("created_at", { ascending: false });

      if (filters?.active !== undefined) query = query.eq("active", filters.active);
      if (filters?.ministryId) query = query.eq("ministry_id", filters.ministryId);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useVolunteer(id: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["volunteer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*, member:members!member_id(id, name, avatar_url, phone, email, status), ministry:ministries!ministry_id(id, name, color)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVolunteer() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      member_id: string;
      role: string;
      ministry_id?: string;
      availability?: string[];
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("volunteers")
        .insert({
          ...input,
          ministry_id: input.ministry_id || null,
          availability: input.availability ?? [],
          church_id: profile.church_id,
          created_by: user.id,
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["volunteers"] }),
  });
}

export function useUpdateVolunteer() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string;
      role?: string;
      ministry_id?: string | null;
      availability?: string[];
      notes?: string;
      active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("volunteers")
        .update(input)
        .eq("id", id)
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      void queryClient.invalidateQueries({ queryKey: ["volunteer", vars.id] });
    },
  });
}

export function useDeleteVolunteer() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("volunteers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["volunteers"] }),
  });
}

// Escalas
export function useVolunteerSchedules(filters?: { volunteerId?: string; month?: string }) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["volunteer_schedules", filters],
    queryFn: async () => {
      let query = supabase
        .from("volunteer_schedules")
        .select("*, volunteer:volunteers!volunteer_id(id, role, member:members!member_id(id, name, avatar_url))")
        .order("date", { ascending: true });

      if (filters?.volunteerId) query = query.eq("volunteer_id", filters.volunteerId);
      if (filters?.month) {
        const [year, month] = filters.month.split("-");
        if (year && month) {
          query = query
            .gte("date", `${year}-${month}-01`)
            .lt("date", `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateSchedule() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      volunteer_id: string;
      date: string;
      period?: string;
      event_id?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("volunteer_schedules")
        .insert({ ...input, event_id: input.event_id || null, church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["volunteer_schedules"] }),
  });
}

export function useDeleteSchedule() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("volunteer_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["volunteer_schedules"] }),
  });
}
