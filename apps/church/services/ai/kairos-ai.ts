/**
 * Kairos AI - servico central de inteligencia artificial
 *
 * Provider principal: OpenRouter DeepSeek Chat V3 free
 * Fallback 1: Llama 3.1 8B (free)
 * Fallback 2: Mistral 7B (free)
 */

export type AIModule =
  | "chat" | "social" | "devotional" | "support" | "calendar"
  | "sermon" | "studies" | "office" | "finance";

export interface KairosContext {
  churchName: string;
  userName?: string;
  userRole?: string;
  activeModule?: AIModule;
  activeModules?: string[];
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface KairosMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildSystemPrompt(ctx: KairosContext): string {
  return "Voce e a Kairos AI, assistente oficial da " + ctx.churchName + ".\n\nIDENTIDADE\nSeu nome e Kairos. Responda com acolhimento, sabedoria e amor cristao.\nTom: amigavel, pastoral, direto e encorajador. Idioma: portugues brasileiro.\n\nCONTEXTO\nUsuario: " + (ctx.userName ?? "Visitante") + " | Papel: " + (ctx.userRole ?? "membro") + "\n\nREGRAS\n1. Sempre em portugues brasileiro.\n2. Maximo 3 paragrafos no chat.\n3. Use linguagem biblica natural.\n4. Nunca invente dados.\n5. Use emojis com moderacao.\n\nESPECIALIDADES\n- Sermoes, esboco e devocionais\n- Postagens para redes sociais\n- Comunicados pastorais\n- Membros, celulas e ministerios\n- Gestao financeira\n- Estudos biblicos\n- Analise de imagens";
}

async function callOpenRouter(
  model: string,
  system: string,
  messages: KairosMessage[],
  imageUrl?: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY nao configurada");

  const lastMsg = messages[messages.length - 1];
  const historyMsgs = messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const lastContent: unknown = imageUrl
    ? [
        { type: "image_url", image_url: { url: imageUrl } },
        { type: "text", text: lastMsg?.content ?? "" },
      ]
    : lastMsg?.content ?? "";

  const allMessages = [
    { role: "system", content: system },
    ...historyMsgs,
    { role: "user", content: lastContent },
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
      "HTTP-Referer": "https://kairos.fbautomacao.space",
      "X-Title": "Kairos AI",
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = await res.json() as {
    choices?: Array<{ message: { content: string } }>;
    error?: { message: string };
  };

  if (!res.ok || data.error) {
    throw new Error("OpenRouter " + model + " error " + res.status + ": " + (data.error?.message ?? res.statusText));
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter " + model + ": resposta vazia");
  return content;
}

export async function kairosAI(
  userMessage: string,
  ctx: KairosContext,
  module: AIModule = "chat",
  imageUrl?: string
): Promise<string> {
  const system = buildSystemPrompt(ctx);
  const messages: KairosMessage[] = [
    ...(ctx.history ?? []),
    { role: "user", content: userMessage },
  ];

  const errors: string[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter("deepseek/deepseek-chat-v3-0324:free", system, messages, imageUrl);
    } catch (e1) {
      errors.push("DeepSeek: " + (e1 instanceof Error ? e1.message : String(e1)));
      console.warn("DeepSeek falhou, tentando Llama:", e1);
      try {
        return await callOpenRouter("meta-llama/llama-3.1-8b-instruct:free", system, messages, imageUrl);
      } catch (e2) {
        errors.push("Llama: " + (e2 instanceof Error ? e2.message : String(e2)));
        console.warn("Llama falhou, tentando Mistral:", e2);
        try {
          return await callOpenRouter("mistralai/mistral-7b-instruct:free", system, messages, imageUrl);
        } catch (e3) {
          errors.push("Mistral: " + (e3 instanceof Error ? e3.message : String(e3)));
          console.error("Todos os modelos falharam:", errors);
          throw new Error("Kairos AI indisponivel. Erros: " + errors.join(" | "));
        }
      }
    }
  }

  throw new Error("OPENROUTER_API_KEY nao configurada.");
}
