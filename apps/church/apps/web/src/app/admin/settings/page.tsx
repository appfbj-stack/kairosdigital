import { Settings, Bot, Globe, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground text-sm">Configurações globais da plataforma Kairos</p>
      </div>

      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Kairos AI</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Modelo padrão</label>
            <select className="w-full px-3 py-2 rounded-lg border bg-muted text-sm">
              <option>anthropic/claude-3.5-sonnet (via OpenRouter)</option>
              <option>gpt-4o-mini (via OpenAI)</option>
              <option>claude-sonnet-4-6 (via Anthropic)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tokens máximos por resposta</label>
            <input defaultValue="2048" type="number" className="w-full px-3 py-2 rounded-lg border bg-muted text-sm" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">* Configurações salvas no .env — edite via painel Dokploy</p>
      </section>

      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Plataforma</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-mono font-medium">v0.1.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Ambiente</span>
            <span className="font-mono font-medium">production</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Banco de dados</span>
            <span className="font-mono font-medium text-green-500">● conectado</span>
          </div>
        </div>
      </section>

      <section className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Notificações</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Sistema de notificações push e email em desenvolvimento.
        </p>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-yellow-500/10 text-yellow-600">
          Em breve
        </span>
      </section>
    </div>
  );
}
