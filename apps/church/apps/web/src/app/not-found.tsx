import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <p className="text-7xl font-bold text-primary/20">404</p>
      <h1 className="text-2xl font-bold mt-4">Página não encontrada</h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
