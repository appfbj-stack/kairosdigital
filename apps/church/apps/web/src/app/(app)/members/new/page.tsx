import { createServerClient } from "@/lib/supabase/server";
import { MemberForm } from "@/features/members/components/member-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Novo Membro — Kairos" };

export default async function NewMemberPage() {
  const supabase = await createServerClient();
  const { data: cells } = await supabase.from("cells").select("id, name").eq("active", true).order("name");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/members" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Membro</h1>
          <p className="text-muted-foreground text-sm">Cadastre um novo membro da igreja</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <MemberForm cells={cells ?? []} />
      </div>
    </div>
  );
}
