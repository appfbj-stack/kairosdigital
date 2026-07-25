import { PrismaClient } from "@prisma/client";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL ?? "openai/gpt-4o-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIConfig {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

const prisma = new PrismaClient();

/**
 * Busca histórico de mensagens de uma conversa e formata para o modelo
 */
export async function buildConversationHistory(
  conversationId: string,
  tenantId: string,
  limit = 20
): Promise<ChatMessage[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId, tenantId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));
}

/**
 * Busca configuração de IA do tenant (system prompt personalizado)
 */
export async function getTenantAIConfig(tenantId: string): Promise<AIConfig> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  const settings = (tenant?.settings as Record<string, unknown>) ?? {};
  return {
    model: (settings.aiModel as string) ?? DEFAULT_MODEL,
    systemPrompt:
      (settings.systemPrompt as string) ??
      "Você é um assistente prestativo e amigável. Responda de forma clara e concisa em português.",
    temperature: (settings.aiTemperature as number) ?? 0.7,
    maxTokens: (settings.aiMaxTokens as number) ?? 500,
  };
}

/**
 * Chama OpenRouter e retorna o texto da resposta
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  config: AIConfig
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://hermes.saas.app",
      "X-Title": "Hermes SaaS",
    },
    body: JSON.stringify({
      model: config.model ?? DEFAULT_MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { total_tokens?: number };
  };

  return data.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Função principal: gera resposta de IA para uma conversa
 */
export async function generateAIReply(
  tenantId: string,
  conversationId: string,
  userText: string
): Promise<{ reply: string; tokensUsed: number }> {
  const [history, aiConfig] = await Promise.all([
    buildConversationHistory(conversationId, tenantId),
    getTenantAIConfig(tenantId),
  ]);

  const messages: ChatMessage[] = [
    { role: "system", content: aiConfig.systemPrompt! },
    ...history,
    { role: "user", content: userText },
  ];

  const reply = await callOpenRouter(messages, aiConfig);

  // Estimativa simples de tokens (4 chars ≈ 1 token)
  const tokensUsed = Math.ceil(
    messages.reduce((acc, m) => acc + m.content.length, 0) / 4
  );

  return { reply, tokensUsed };
}
