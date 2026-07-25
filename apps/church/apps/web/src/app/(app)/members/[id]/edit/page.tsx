import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MemberForm } from "@/features/members/components/member-form";

export const metadata = { title: "Editar Membro — Kairos" };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: member }, { data: cells }] = await Promise.all([
    supabase.from("members").select("*").eq("id", id).single(),
    supabase.from("cells").select("id, name").eq("active", true).order("name"),
  ]);

  if (!member) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/members/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Membro</h1>
          <p className="text-muted-foreground text-sm">{member.name}</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <MemberForm member={member} cells={cells ?? []} />
      </div>
    </div>
  );
}
