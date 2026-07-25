import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VolunteerForm } from "@/features/volunteers/components/volunteer-form";

export const metadata = { title: "Editar Voluntário — Kairos" };

export default async function EditVolunteerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: volunteer }, { data: members }, { data: ministries }] = await Promise.all([
    supabase.from("volunteers").select("*, member:members!member_id(name)").eq("id", id).single(),
    supabase.from("members").select("id, name").eq("status", "active").order("name"),
    supabase.from("ministries").select("id, name, color").order("name"),
  ]);

  if (!volunteer) notFound();
  const memberName = Array.isArray(volunteer.member) ? volunteer.member[0]?.name : volunteer.member?.name;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/volunteers/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Voluntário</h1>
          <p className="text-muted-foreground text-sm">{memberName ?? ""}</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <VolunteerForm volunteer={volunteer} members={members ?? []} ministries={ministries ?? []} />
      </div>
    </div>
  );
}
