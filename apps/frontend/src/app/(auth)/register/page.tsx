"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

// Gera slug a partir do nome/email
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Auto-gera tenantName e tenantSlug a partir do nome e email
      const tenantSlug = toSlug(form.email.split("@")[0]) + "-" + Date.now().toString(36);
      const payload = {
        tenantName: form.name,
        tenantSlug,
        ownerName: form.name,
        ownerEmail: form.email,
        ownerPassword: form.password,
        planTier: "BASIC" as const,
      };
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Login automático após registro
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      router.push("/app/chat");
    } catch (err: any) {
      setError(err.message ?? "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-4">
      {/* Glow dourado de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37] opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#141414] shadow-[0_0_24px_rgba(212,175,55,0.15)]">
            <span className="text-2xl font-bold text-[#D4AF37]">H</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-[#8A8A8A]">
            Comece a usar o Hermes OS gratuitamente
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#141414] p-8 shadow-[0_4px_48px_rgba(0,0,0,0.7)]">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#8A8A8A]">
                Seu nome
              </label>
              <input
                type="text"
                required
                placeholder="João Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-[#D4AF37]/20 bg-[#0B0B0B] px-4 py-3 text-sm text-[#F5F5F2] placeholder-[#555] outline-none transition focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
              />
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#8A8A8A]">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="voce@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[#D4AF37]/20 bg-[#0B0B0B] px-4 py-3 text-sm text-[#F5F5F2] placeholder-[#555] outline-none transition focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#8A8A8A]">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-[#D4AF37]/20 bg-[#0B0B0B] px-4 py-3 text-sm text-[#F5F5F2] placeholder-[#555] outline-none transition focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-900/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#A08020] py-3 text-sm font-semibold text-[#0B0B0B] transition hover:from-[#E8C958] hover:to-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Link para login */}
        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-[#D4AF37] hover:text-[#E8C958] transition"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
