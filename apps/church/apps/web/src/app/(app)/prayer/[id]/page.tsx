import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrayerCard } from "@/features/prayer/components/prayer-card";

export default async function PrayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: request } = await supabase
    .from("prayer_requests")
    .select("*, requester:users!created_by(name, avatar_url)")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canManage = ["super_admin", "church_admin", "pastor"].includes(profile?.role ?? "");

  const requester = Array.isArray(request.requester) ? request.requester[0] : request.requester;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/prayer" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Pedido de Oração</h1>
          <p className="text-muted-foreground text-sm">Detalhe completo</p>
        </div>
      </div>

      <PrayerCard
        request={{ ...request, requester: requester ?? null }}
        canManage={canManage}
        canDelete={canManage}
      />
    </div>
  );
}
