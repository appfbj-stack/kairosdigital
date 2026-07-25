import "../styles/globals.css";
import Link from "next/link";

export const metadata = { title: "Hermes OS — Admin", description: "Painel super admin" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-60 bg-slate-950 p-4 ring-1 ring-slate-800">
            <div className="mb-8 flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">H</span>
              Hermes Admin
            </div>
            <nav className="flex flex-col gap-1 text-sm">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-800">📊 Dashboard</Link>
              <Link href="/tenants" className="rounded-lg px-3 py-2 hover:bg-slate-800">🏢 Tenants</Link>
              <Link href="/logs" className="rounded-lg px-3 py-2 hover:bg-slate-800">📜 Logs</Link>
              <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-slate-800">🔐 Login</Link>
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
