import type { FastifyInstance } from "fastify";
import { WhatsAppCreateInstanceSchema, WhatsAppSendMessageSchema } from "@hermes/types";
import { whatsappService } from "../services/whatsapp.service.js";
import { requireTenant } from "../middleware/tenant.js";

export async function whatsappRoutes(app: FastifyInstance) {
  app.get(
    "/whatsapp/instances",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => whatsappService.list(req.tenantId)
  );

  app.post(
    "/whatsapp/instances",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = WhatsAppCreateInstanceSchema.parse(req.body);
      const inst = await whatsappService.createInstance(req.tenantId, input.name);
      return reply.code(201).send(inst);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/whatsapp/instances/:id/qr",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => whatsappService.getQrCode(req.tenantId, req.params.id)
  );

  app.delete<{ Params: { id: string } }>(
    "/whatsapp/instances/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      await whatsappService.delete(req.tenantId, req.params.id);
      return reply.code(204).send();
    }
  );

  app.post(
    "/whatsapp/send",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const input = WhatsAppSendMessageSchema.parse(req.body);
      if (!input.text) throw new Error("text obrigatório nesta versão");
      return whatsappService.sendText(req.tenantId, input.instanceId, input.to, input.text);
    }
  );
}
