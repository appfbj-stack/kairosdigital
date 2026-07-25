"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

interface UploadResult {
  url: string;
  path: string;
}

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const upload = async (file: File, memberId: string): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil não encontrado");

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${profile.church_id}/${memberId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      return { url: publicUrl, path };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro no upload";
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string) => {
    await supabase.storage.from("avatars").remove([path]);
  };

  return { upload, remove, uploading, error };
}
