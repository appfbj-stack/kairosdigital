import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kairos CRM",
  description: "CRM Inteligente com WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}