"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Settings, User, Church, Shield } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  church_admin: "Admin da Igreja",
  pastor: "Pastor",
  leader: "Líder",
  member: "Membro",
  visitor: "Visitante",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

interface Profile {
  id: string;
  name: string;
  role: string;
  avatar_url?: string | null;
  church_id: string;
}

interface Church {
  id: string;
  name: string;
  plan: string;
}

export function SettingsClient({
  profile,
  church,
  email,
}: {
  profile: Profile | null;
  church: Church | null;
  email: string;
}) {
  const supabase = createBrowserClient();
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo deve ter no máximo 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `users/${profile.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("users")
        .update({ name: name.trim(), avatar_url: avatarUrl })
        .eq("id", profile.id);
      if (error) throw error;

      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie seu perfil e preferências</p>
      </div>

      {/* Perfil */}
      <section className="bg-card border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Meu Perfil</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <MemberAvatar
              name={name || profile?.name || "U"}
              avatarUrl={avatarPreview ?? profile?.avatar_url}
              size="xl"
            />
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-white text-xs font-medium">Alterar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="font-medium">{profile?.name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <span className="inline-flex mt-1 items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
              {ROLE_LABELS[profile?.role ?? "member"] ?? profile?.role}
            </span>
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value={email}
            disabled
            className="w-full px-3 py-2 rounded-lg border bg-muted text-muted-foreground text-sm cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email não pode ser alterado aqui</p>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Salvando..." : "Salvar Perfil"}
        </button>
      </section>

      {/* Igreja */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Church className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Minha Igreja</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nome da Igreja</label>
            <p className="text-sm font-medium">{church?.name ?? "—"}</p>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Plano</label>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
              {PLAN_LABELS[church?.plan ?? "free"] ?? church?.plan ?? "Gratuito"}
            </span>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">ID da Igreja</label>
            <p className="text-xs text-muted-foreground font-mono">{church?.id ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Segurança</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Senha</p>
            <p className="text-xs text-muted-foreground">Altere sua senha de acesso</p>
          </div>
          <button
            onClick={async () => {
              const supabaseBrowser = createBrowserClient();
              await supabaseBrowser.auth.resetPasswordForEmail(email);
              toast.success("Email de redefinição enviado!");
            }}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Redefinir Senha
          </button>
        </div>
      </section>
    </div>
  );
}
