—import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Hermes OS",
  description: "Sistema Operacional Empresarial com IA — Tecnologia dos Deuses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full dark">
      <body className="h-full antialiased bg-[#0B0B0B] text-[#F5F5F2]">{children}</body>
    </html>
  );
}
