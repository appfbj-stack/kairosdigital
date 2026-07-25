"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  churchName: z.string().min(3, "Nome da igreja obrigatório"),
  name: z.string().min(2, "Seu nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createBrowserClient();

    const { data: signupData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, church_name: data.churchName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Se já tem sessão (email confirmation desabilitado), cria perfil agora
    if (signupData.user && signupData.session) {
      await supabase.rpc("create_missing_profile", {
        p_user_id: signupData.user.id,
        p_email: data.email,
        p_name: data.name,
        p_church_name: data.churchName,
      });
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
      return;
    }

    toast.success("Conta criada! Verifique seu email.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Kairos</h1>
          <p className="mt-2 text-muted-foreground">Cadastre sua igreja</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "churchName", label: "Nome da Igreja", placeholder: "Igreja Comunidade da Graça", type: "text" },
            { name: "name", label: "Seu Nome", placeholder: "Pastor João Silva", type: "text" },
            { name: "email", label: "Email", placeholder: "pastor@igreja.com", type: "email" },
            { name: "password", label: "Senha", placeholder: "••••••••", type: "password" },
            { name: "confirmPassword", label: "Confirmar Senha", placeholder: "••••••••", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                {...register(field.name as keyof FormData)}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors[field.name as keyof FormData] && (
                <p className="text-destructive text-xs mt-1">
                  {errors[field.name as keyof FormData]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
