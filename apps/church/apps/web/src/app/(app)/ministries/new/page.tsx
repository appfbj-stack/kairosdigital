import { createServerClient } from "@/lib/supabase/server";
import { MinistryForm } from "@/features/ministries/components/ministry-form";

export default async function NewMinistryPage() {
  const supabase = await createServerClient();
  const { data: leaders } = await supabase
    .from("members")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Ministério</h1>
        <p className="text-muted-foreground text-sm">Preencha os dados do ministério</p>
      </div>
      <MinistryForm leaders={leaders ?? []} />
    </div>
  );
}
