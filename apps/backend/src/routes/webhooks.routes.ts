import { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

const whatsappQueue = new Queue("whatsapp", { connection: redis });

interface EvolutionMessage {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: { text: string };
      imageMessage?: { caption?: string };
      audioMessage?: Record<string, unknown>;
      documentMessage?: { title?: string };
    };
    messageType: string;
    messageTimestamp: number;
    instanceId: string;
    source: string;
  };
}

function extractText(msg: EvolutionMessage["data"]["message"]): string | null {
  if (!msg) return null;
  return (
    msg.conversation ??
    msg.extendedTextMessage?.text ??
    msg.imageMessage?.caption ??
    null
  );
}

export async function webhookRoutes(app: FastifyInstance) {
  // Evolution API envia POST para /api/webhooks/evolution/:tenantId
  app.post<{ Params: { tenantId: string } }>(
    "/evolution/:tenantId",
    async (req, reply) => {
      const { tenantId } = req.params;
      const payload = req.body as EvolutionMessage;

      // Ignorar eventos que não são mensagens recebidas
      if (payload.event !== "messages.upsert") {
        return reply.send({ ok: true, skipped: true });
      }

      const { key, message, messageType, pushName, messageTimestamp } =
        payload.data;

      // Ignorar mensagens enviadas pelo próprio bot
      if (key.fromMe) {
        return reply.send({ ok: true, skipped: "fromMe" });
      }

      // Ignorar grupos (remoteJid termina com @g.us)
      if (key.remoteJid.endsWith("@g.us")) {
        return reply.send({ ok: true, skipped: "group" });
      }

      const phone = key.remoteJid.replace("@s.whatsapp.net", "");
      const text = extractText(message);

      // Buscar instância WhatsApp do tenant
      const instance = await app.prisma.whatsAppInstance.findFirst({
        where: { tenantId, instanceName: payload.instance },
      });

      if (!instance) {
        app.log.warn(`[webhook] Instância ${payload.instance} não encontrada para tenant ${tenantId}`);
        return reply.send({ ok: true, skipped: "no_instance" });
      }

      // Resolver ou criar contato
      let contact = await app.prisma.contact.findFirst({
        where: { tenantId, phone },
      });

      if (!contact) {
        contact = await app.prisma.contact.create({
          data: {
            tenantId,
            name: pushName ?? phone,
            phone,
            tags: [],
          },
        });
      } else if (pushName && contact.name === contact.phone) {
        // Atualizar nome se ainda era o telefone
        await app.prisma.contact.update({
          where: { id: contact.id },
          data: { name: pushName },
        });
      }

      // Resolver ou criar conversa
      let conversation = await app.prisma.conversation.findFirst({
        where: { tenantId, contactId: contact.id, instanceId: instance.id },
        orderBy: { createdAt: "desc" },
      });

      if (!conversation) {
        conversation = await app.prisma.conversation.create({
          data: {
            tenantId,
            contactId: contact.id,
            instanceId: instance.id,
            status: "OPEN",
            channel: "WHATSAPP",
          },
        });
      }

      // Salvar mensagem recebida
      const savedMessage = await app.prisma.message.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          role: "USER",
          content: text ?? `[${messageType}]`,
          metadata: { whatsappMsgId: key.id, messageType, timestamp: messageTimestamp },
        },
      });

      // Atualizar lastMessageAt da conversa
      await app.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), updatedAt: new Date() },
      });

      // Só enfileira job de IA se tiver texto
      if (text) {
        await whatsappQueue.add(
          "process-message",
          {
            tenantId,
            conversationId: conversation.id,
            messageId: savedMessage.id,
            instanceId: instance.id,
            contactId: contact.id,
            phone,
            text,
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
          }
        );
      }

      app.log.info(
        `[webhook] Mensagem de ${phone} (${pushName}) → conversa ${conversation.id}`
      );

      return reply.send({ ok: true, conversationId: conversation.id });
    }
  );
}
