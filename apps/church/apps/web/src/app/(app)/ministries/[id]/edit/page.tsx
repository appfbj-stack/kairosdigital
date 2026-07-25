import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MinistryForm } from "@/features/ministries/components/ministry-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditMinistryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [{ data: ministry }, { data: leaders }] = await Promise.all([
    supabase.from("ministries").select("*").eq("id", id).single(),
    supabase.from("members").select("id, name").eq("status", "active").order("name"),
  ]);

  if (!ministry) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/ministries/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Ministério</h1>
          <p className="text-muted-foreground text-sm">{ministry.name}</p>
        </div>
      </div>
      <MinistryForm ministry={ministry} leaders={leaders ?? []} />
    </div>
  );
}
