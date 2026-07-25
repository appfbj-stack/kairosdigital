import { PrayerForm } from "@/features/prayer/components/prayer-form";

export default function NewPrayerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Pedido de Oração</h1>
        <p className="text-muted-foreground text-sm">Compartilhe seu pedido com a comunidade</p>
      </div>
      <PrayerForm />
    </div>
  );
}
