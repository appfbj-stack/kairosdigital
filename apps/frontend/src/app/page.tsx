import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-4 py-1.5 text-sm text-indigo-700 backdrop-blur dark:border-indigo-800 dark:bg-slate-900/60 dark:text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          Hermes OS — Sistema operacional empresarial com IA
        </div>
        <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Converse com sua empresa.
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          CRM, agenda, WhatsApp, follow-up e automações — orquestrados por agentes IA. Tudo em uma só conversa.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
