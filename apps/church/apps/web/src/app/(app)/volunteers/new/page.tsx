import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VolunteerForm } from "@/features/volunteers/components/volunteer-form";

export const metadata = { title: "Novo Voluntário — Kairos" };

export default async function NewVolunteerPage() {
  const supabase = await createServerClient();

  const [{ data: members }, { data: ministries }] = await Promise.all([
    supabase.from("members").select("id, name").eq("status", "active").order("name"),
    supabase.from("ministries").select("id, name, color").order("name"),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/volunteers" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Voluntário</h1>
          <p className="text-muted-foreground text-sm">Cadastre um voluntário com função e disponibilidade</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <VolunteerForm members={members ?? []} ministries={ministries ?? []} />
      </div>
    </div>
  );
}
