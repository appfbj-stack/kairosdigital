import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireTenant } from "../middleware/tenant.js";
import { NotFoundError } from "@kairosdigital/utils";

const PipelineCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const StageCreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  order: z.number().int().optional(),
});

export async function pipelineRoutes(app: FastifyInstance) {
  // Listar pipelines do tenant
  app.get(
    "/pipelines",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      return app.prisma.pipeline.findMany({
        where: { tenantId: req.tenantId },
        include: {
          stages: { orderBy: { order: "asc" } },
          _count: { select: { stages: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    }
  );

  // Criar pipeline
  app.post(
    "/pipelines",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = PipelineCreateSchema.parse(req.body);
      const pipeline = await app.prisma.pipeline.create({
        data: {
          ...input,
          tenantId: req.tenantId,
          stages: {
            create: [
              { name: "Lead", order: 0, color: "#94a3b8", probability: 10 },
              { name: "Qualificado", order: 1, color: "#3b82f6", probability: 30 },
              { name: "Proposta", order: 2, color: "#f59e0b", probability: 60 },
              { name: "Fechado", order: 3, color: "#10b981", probability: 100 },
            ],
          },
        },
        include: { stages: true },
      });
      return reply.code(201).send(pipeline);
    }
  );

  // Detalhe do pipeline com contatos por estágio
  app.get<{ Params: { id: string } }>(
    "/pipelines/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const p = await app.prisma.pipeline.findFirst({
        where: { id: req.params.id, tenantId: req.tenantId },
        include: {
          stages: {
            orderBy: { order: "asc" },
            include: { contacts: { select: { id: true, name: true, email: true, phone: true, company: true, tags: true } } },
          },
        },
      });
      if (!p) throw new NotFoundError("Pipeline");
      return p;
    }
  );

  // Atualizar pipeline
  app.patch<{ Params: { id: string } }>(
    "/pipelines/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const input = PipelineCreateSchema.partial().parse(req.body);
      const updated = await app.prisma.pipeline.updateMany({
        where: { id: req.params.id, tenantId: req.tenantId },
        data: input,
      });
      if (updated.count === 0) throw new NotFoundError("Pipeline");
      return app.prisma.pipeline.findUnique({ where: { id: req.params.id }, include: { stages: true } });
    }
  );

  // Deletar pipeline
  app.delete<{ Params: { id: string } }>(
    "/pipelines/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const deleted = await app.prisma.pipeline.deleteMany({
        where: { id: req.params.id, tenantId: req.tenantId },
      });
      if (deleted.count === 0) throw new NotFoundError("Pipeline");
      return reply.code(204).send();
    }
  );

  // Adicionar estágio
  app.post<{ Params: { id: string } }>(
    "/pipelines/:id/stages",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const pipeline = await app.prisma.pipeline.findFirst({
        where: { id: req.params.id, tenantId: req.tenantId },
      });
      if (!pipeline) throw new NotFoundError("Pipeline");

      const input = StageCreateSchema.parse(req.body);
      const maxOrder = await app.prisma.pipelineStage.aggregate({
        where: { pipelineId: req.params.id },
        _max: { order: true },
      });

      const stage = await app.prisma.pipelineStage.create({
        data: {
          ...input,
          order: input.order ?? (maxOrder._max.order ?? -1) + 1,
          pipelineId: req.params.id,
        },
      });
      return reply.code(201).send(stage);
    }
  );

  // Atualizar estágio
  app.patch<{ Params: { id: string; stageId: string } }>(
    "/pipelines/:id/stages/:stageId",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const input = StageCreateSchema.partial().parse(req.body);
      const updated = await app.prisma.pipelineStage.updateMany({
        where: { id: req.params.stageId, pipelineId: req.params.id },
        data: input,
      });
      if (updated.count === 0) throw new NotFoundError("Estágio");
      return app.prisma.pipelineStage.findUnique({ where: { id: req.params.stageId } });
    }
  );

  // Deletar estágio
  app.delete<{ Params: { id: string; stageId: string } }>(
    "/pipelines/:id/stages/:stageId",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const deleted = await app.prisma.pipelineStage.deleteMany({
        where: { id: req.params.stageId, pipelineId: req.params.id },
      });
      if (deleted.count === 0) throw new NotFoundError("Estágio");
      return reply.code(204).send();
    }
  );

  // Mover contato para estágio
  app.patch<{ Params: { id: string }; Body: { contactId: string; stageId: string } }>(
    "/pipelines/:id/move-contact",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const { contactId, stageId } = req.body;
      const stage = await app.prisma.pipelineStage.findFirst({
        where: { id: stageId, pipelineId: req.params.id },
      });
      if (!stage) throw new NotFoundError("Estágio");

      const updated = await app.prisma.contact.updateMany({
        where: { id: contactId, tenantId: req.tenantId },
        data: { pipelineStageId: stageId },
      });
      if (updated.count === 0) throw new NotFoundError("Contato");
      return app.prisma.contact.findUnique({ where: { id: contactId } });
    }
  );
}
