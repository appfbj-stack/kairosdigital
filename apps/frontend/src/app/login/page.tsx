"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2, Building2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [vertical, setVertical] = useState("CUSTOM");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { data } = await authApi.login(email, password);
        document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        setAuth(data.access_token, data.tenant);
        router.push("/painel");
      } else {
        const { data } = await authApi.register({ name, slug, email, password, vertical });
        document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        setAuth(data.access_token, data.tenant);
        router.push("/painel");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Erro ao autenticar");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
          <h1 className="text-2xl font-bold">Kairos CRM</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Nome da empresa</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Imobiliária João Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subdomínio (slug)</label>
                <div className="relative">
                  <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="minha-imobiliaria" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">.seudominio.com</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Segmento</label>
                <select value={vertical} onChange={e => setVertical(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="REAL_ESTATE">🏠 Imobiliária</option>
                  <option value="AUTOMOTIVE">🔧 Mecânica / Auto Center</option>
                  <option value="RETAIL">🛍️ Varejo / Loja</option>
                  <option value="FOOD_SERVICE">🍔 Restaurante / Delivery</option>
                  <option value="HEALTH">🏥 Clínica / Consultório</option>
                  <option value="BEAUTY">💇 Salão / Barbearia</option>
                  <option value="EDUCATION">📚 Escola / Curso</option>
                  <option value="SERVICES">🛠️ Serviços Gerais</option>
                  <option value="CUSTOM">⚙️ Outro / Personalizado</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta e começar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? "Não tem conta?" : "Já tem conta?"} 
          <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }} className="text-blue-600 hover:underline ml-1">
            {mode === "login" ? "Criar grátis" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}