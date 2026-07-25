import { PrismaClient } from "@prisma/client";
import { createWorker } from "../lib/queue.js";
import {
  generateAIReply,
} from "../../backend/src/services/ai.service.js";

const prisma = new PrismaClient();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL ?? "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY ?? "";

interface WhatsAppJob {
  tenantId: string;
  conversationId: string;
  messageId: string;
  instanceId: string;
  contactId: string;
  phone: string;
  text: string;
}

export const whatsappWorker = createWorker<WhatsAppJob>(
  "whatsapp",
  async (job) => {
    const { tenantId, conversationId, instanceId, contactId, phone, text } =
      job.data;

    console.log(
      `[whatsapp] Job ${job.id} | conversa ${conversationId} | phone ${phone}`
    );

    // 1. Get WhatsApp instance (need instanceName for Evolution API)
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId },
    });
    if (!instance) {
      throw new Error(`Instância ${instanceId} não encontrada`);
    }

    if (!instance.isActive) {
      console.log(
        `[whatsapp] Instância ${instance.instanceName} inativa, ignorando`
      );
      return { skipped: true };
    }

    // 2. Generate AI reply (calls OpenRouter with conversation history)
    console.log(`[whatsapp] Chamando IA para conversa ${conversationId}…`);
    const { reply, tokensUsed } = await generateAIReply(
      tenantId,
      conversationId,
      text
    );

    if (!reply || reply.trim() === "") {
      console.warn(`[whatsapp] Resposta IA vazia para job ${job.id}`);
      return { skipped: true, reason: "empty_reply" };
    }

    // 3. Save assistant message to DB
    await prisma.message.create({
      data: {
        tenantId,
        conversationId,
        contactId,
        role: "ASSISTANT",
        content: reply,
        status: "SENT",
      },
    });

    // 4. Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // 5. Send via Evolution API
    const evolutionRes = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${instance.instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: phone,
          text: reply,
        }),
      }
    );

    if (!evolutionRes.ok) {
      const errBody = await evolutionRes.text();
      throw new Error(`Evolution API ${evolutionRes.status}: ${errBody}`);
    }

    // 6. Log AI usage in AuditLog
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "AI_REPLY_SENT",
        entityType: "Conversation",
        entityId: conversationId,
        metadata: {
          phone,
          tokensUsed,
          model: process.env.OPENROUTER_DEFAULT_MODEL ?? "openai/gpt-4o-mini",
          replyPreview: reply.substring(0, 100),
        },
      },
    });

    console.log(
      `[whatsapp] ✅ Resposta enviada para ${phone} | ${tokensUsed} tokens | "${reply.substring(0, 60)}…"`
    );

    return { reply, tokensUsed, phone };
  }
);
