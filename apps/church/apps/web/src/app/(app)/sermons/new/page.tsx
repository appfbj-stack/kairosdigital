import { SermonForm } from "@/features/sermons/components/sermon-form";

export default function NewSermonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Sermão</h1>
        <p className="text-muted-foreground text-sm">Cadastre um sermão no acervo da igreja</p>
      </div>
      <SermonForm />
    </div>
  );
}
