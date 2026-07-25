"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/app/chat");
    } catch (err: any) {
      setError(err.message ?? "E-mail ou senha inválidos");
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
            Bem-vindo de volta
          </h1>
          <p className="mt-1 text-sm text-[#8A8A8A]">
            Entre na sua conta Hermes OS
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#141414] p-8 shadow-[0_4px_48px_rgba(0,0,0,0.7)]">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#8A8A8A]">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Link para registro */}
        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-[#D4AF37] hover:text-[#E8C958] transition"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
