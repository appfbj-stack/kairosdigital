import { prisma } from "../lib/prisma.js";
import { chatStream, type ORMessage } from "../lib/openrouter.js";
import { ensureAiQuota, recordAiUsage } from "./billing.service.js";
import { env } from "../config/env.js";
import { ORQUESTRADOR_PROMPT } from "@hermes/agents";

const HISTORY_LIMIT = 20;

export interface StreamChatArgs {
  tenantId: string;
  userId: string;
  conversationId?: string;
  message: string;
  model?: string;
  agentName?: string;
}

/**
 * Persiste mensagem do usuário, chama IA com streaming, persiste resposta + usage.
 * Retorna um async iterator de deltas (string) + metadata final.
 */
export async function* streamChat(args: StreamChatArgs) {
  await ensureAiQuota(args.tenantId);

  // 1. obter/criar conversation
  let conv = args.conversationId
    ? await prisma.conversation.findFirst({
        where: { id: args.conversationId, tenantId: args.tenantId },
      })
    : null;
  if (!conv) {
    conv = await prisma.conversation.create({
      data: {
        tenantId: args.tenantId,
        channel: "WEB",
        title: args.message.slice(0, 60),
        isAiHandled: true,
      },
    });
  }

  // 2. persistir mensagem do usuário
  await prisma.message.create({
    data: {
      tenantId: args.tenantId,
      conversationId: conv.id,
      direction: "INBOUND",
      type: "TEXT",
      content: args.message,
      senderId: args.userId,
      senderName: "user",
    },
  });

  // 3. carregar histórico (ordem cronológica)
  const history = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });

  const messages: ORMessage[] = [
    { role: "system", content: ORQUESTRADOR_PROMPT },
    ...history.map((m) => ({
      role: m.direction === "INBOUND" ? ("user" as const) : ("assistant" as const),
      content: m.content ?? "",
    })),
  ];

  // 4. stream
  let fullText = "";
  let lastModel = args.model ?? env.OPENROUTER_DEFAULT_MODEL;
  let promptTokens = 0;
  let completionTokens = 0;

  for await (const chunk of chatStream({ model: args.model, messages })) {
    if (chunk.delta) {
      fullText += chunk.delta;
      yield { type: "delta" as const, content: chunk.delta };
    }
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens;
      completionTokens = chunk.usage.completion_tokens;
    }
    lastModel = chunk.model;
  }

  // 5. persistir resposta + usage
  const aiMessage = await prisma.message.create({
    data: {
      tenantId: args.tenantId,
      conversationId: conv.id,
      direction: "OUTBOUND",
      type: "TEXT",
      content: fullText,
      senderId: "ai-agent",
      senderName: args.agentName ?? "Hermes",
      isAiGenerated: true,
      aiModel: lastModel,
    },
  });

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: new Date() },
  });

  await recordAiUsage({
    tenantId: args.tenantId,
    userId: args.userId,
    model: lastModel,
    promptTokens,
    completionTokens,
    agentName: args.agentName,
    conversationId: conv.id,
  });

  yield {
    type: "done" as const,
    conversationId: conv.id,
    messageId: aiMessage.id,
    model: lastModel,
    usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
  };
}
