"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@kairos/chat/types";

export function useMessages(roomId: string) {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("k_messages")
        .select("id, church_id, room_id, sender_id, content, created_at, sender:users!sender_id(id, name, avatar_url, role)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) { console.error("useMessages:", error.message); return []; }
      return (data ?? []).map((m) => {
        const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender;
        return {
          id: m.id, churchId: m.church_id, roomId: m.room_id,
          senderId: m.sender_id, content: m.content, type: "text" as const,
          mediaUrl: null, createdAt: m.created_at,
          sender: sender ? { id: sender.id, name: sender.name, avatarUrl: sender.avatar_url, role: sender.role } : undefined,
        };
      });
    },
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`kroom:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "k_messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const msg = payload.new as { id: string; church_id: string; room_id: string; sender_id: string; content: string; created_at: string };
          const { data: s } = await supabase.from("users").select("id, name, avatar_url, role").eq("id", msg.sender_id).single();
          queryClient.setQueryData<ChatMessage[]>(["messages", roomId], (prev) => [
            ...(prev ?? []),
            { id: msg.id, churchId: msg.church_id, roomId: msg.room_id, senderId: msg.sender_id,
              content: msg.content, type: "text", mediaUrl: null, createdAt: msg.created_at,
              sender: s ? { id: s.id, name: s.name, avatarUrl: s.avatar_url, role: s.role } : undefined },
          ]);
        })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [roomId, supabase, queryClient]);

  return query;
}

export function useSendMessage(roomId: string) {
  const supabase = createBrowserClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar logado.");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile?.church_id) throw new Error("Perfil não configurado.");
      const { error } = await supabase.from("k_messages").insert({
        room_id: roomId, sender_id: user.id, church_id: profile.church_id, content: content.trim(),
      });
      if (error) throw new Error(`Erro ao enviar: ${error.message}`);
    },
  });
}
