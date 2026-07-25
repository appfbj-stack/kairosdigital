"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { ChatRoom } from "@kairos/chat/types";

export function useRooms() {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async (): Promise<ChatRoom[]> => {
      const { data, error } = await supabase
        .from("k_rooms")
        .select("id, name, type, church_id, created_at, created_by")
        .order("name");
      if (error) { console.error("useRooms:", error.message); return []; }
      return (data ?? []).map((r) => ({
        id: r.id,
        churchId: r.church_id,
        name: r.name,
        type: r.type as ChatRoom["type"],
        createdAt: r.created_at,
        createdBy: r.created_by,
      }));
    },
  });
}

export function useCreateRoom() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; type?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar logado.");

      const { data: profile } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();
      if (!profile?.church_id) throw new Error("Perfil não configurado. Recarregue a página.");

      const { data, error } = await supabase
        .from("k_rooms")
        .insert({ name: input.name, type: input.type ?? "general", church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw new Error(`Erro ao criar sala: ${error.message}`);
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["chat-rooms"] }),
  });
}
