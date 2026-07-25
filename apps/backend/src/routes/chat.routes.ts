import type { FastifyInstance } from "fastify";
import { ChatRequestSchema } from "@hermes/types";
import { streamChat } from "../services/chat.service.js";
import { requireTenant } from "../middleware/tenant.js";

export async function chatRoutes(app: FastifyInstance) {
  // POST /chat/stream — SSE
  app.post(
    "/chat/stream",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = ChatRequestSchema.parse(req.body);

      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("X-Accel-Buffering", "no");
      reply.raw.flushHeaders?.();

      const send = (data: unknown) => {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        for await (const chunk of streamChat({
          tenantId: req.tenantId,
          userId: req.user.userId,
          conversationId: input.conversationId,
          message: input.message,
          model: input.model,
          agentName: input.agentName,
        })) {
          send(chunk);
        }
      } catch (err: any) {
        send({ type: "error", message: err?.message ?? "erro" });
      } finally {
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
      }
    }
  );

  // GET /conversations
  app.get(
    "/conversations",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const list = await app.prisma.conversation.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { lastMessageAt: "desc" },
        take: 50,
        include: { contact: { select: { id: true, name: true, avatarUrl: true } } },
      });
      return { items: list };
    }
  );

  // GET /conversations/:id/messages
  app.get<{ Params: { id: string } }>(
    "/conversations/:id/messages",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const messages = await app.prisma.message.findMany({
        where: { conversationId: req.params.id, tenantId: req.tenantId },
        orderBy: { createdAt: "asc" },
        take: 200,
      });
      return { items: messages };
    }
  );
}
