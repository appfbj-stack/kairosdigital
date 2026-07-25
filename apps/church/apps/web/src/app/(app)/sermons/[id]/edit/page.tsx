import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SermonForm } from "@/features/sermons/components/sermon-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditSermonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: sermon } = await supabase.from("sermons").select("*").eq("id", id).single();

  if (!sermon) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/sermons/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Sermão</h1>
          <p className="text-muted-foreground text-sm">{sermon.title}</p>
        </div>
      </div>
      <SermonForm sermon={sermon} />
    </div>
  );
}
