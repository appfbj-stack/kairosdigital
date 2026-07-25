"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export const POST_TYPES = [
  { value: "aviso", label: "Aviso", emoji: "📢", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { value: "versiculo", label: "Versículo", emoji: "📖", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  { value: "comunicado", label: "Comunicado", emoji: "📋", color: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  { value: "celebracao", label: "Celebração", emoji: "🎉", color: "bg-green-500/20 text-green-600 dark:text-green-400" },
  { value: "evento", label: "Evento", emoji: "📅", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
] as const;

export const REACTIONS = [
  { type: "like", emoji: "👍" },
  { type: "heart", emoji: "❤️" },
  { type: "praying", emoji: "🙏" },
  { type: "fire", emoji: "🔥" },
] as const;

export function useMuralPosts(filter?: string) {
  const supabase = createBrowserClient();
  return useQuery({
    queryKey: ["mural_posts", filter],
    queryFn: async () => {
      let query = supabase
        .from("mural_posts")
        .select("*, author:users!author_id(id, name, avatar_url, role), reactions:mural_reactions(id, type, user_id)")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (filter && filter !== "all") query = query.eq("type", filter);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreatePost() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; content: string; type: string; pinned?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile?.church_id) throw new Error("Perfil não configurado");

      const { data, error } = await supabase
        .from("mural_posts")
        .insert({ ...input, author_id: user.id, church_id: profile.church_id, created_by: user.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mural_posts"] }),
  });
}

export function useDeletePost() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mural_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mural_posts"] }),
  });
}

export function useTogglePinPost() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase.from("mural_posts").update({ pinned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mural_posts"] }),
  });
}

export function useToggleReaction() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, type, hasReacted }: { postId: string; type: string; hasReacted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("users").select("church_id").eq("id", user.id).single();
      if (!profile?.church_id) throw new Error("Perfil não configurado");

      if (hasReacted) {
        await supabase.from("mural_reactions").delete()
          .eq("post_id", postId).eq("user_id", user.id).eq("type", type);
      } else {
        await supabase.from("mural_reactions").insert({
          post_id: postId, user_id: user.id, type, church_id: profile.church_id,
        });
      }
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mural_posts"] }),
  });
}
