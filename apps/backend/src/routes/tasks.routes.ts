import type { FastifyInstance } from "fastify";
import { TaskCreateSchema, AppointmentCreateSchema } from "@hermes/types";
import { requireTenant } from "../middleware/tenant.js";

export async function tasksRoutes(app: FastifyInstance) {
  app.get(
    "/tasks",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      return app.prisma.task.findMany({
        where: { tenantId: req.tenantId },
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        take: 200,
      });
    }
  );

  app.post(
    "/tasks",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = TaskCreateSchema.parse(req.body);
      const task = await app.prisma.task.create({
        data: { ...input, tenantId: req.tenantId, creatorId: req.user.userId },
      });
      return reply.code(201).send(task);
    }
  );

  app.patch(
    "/tasks/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const { id } = req.params as { id: string };
      const { status, title, priority, dueAt } = req.body as Record<string, unknown>;

      const data: Record<string, unknown> = {};
      if (status !== undefined) data.status = status;
      if (title !== undefined) data.title = title;
      if (priority !== undefined) data.priority = priority;
      if (dueAt !== undefined) data.dueAt = dueAt === null ? null : new Date(dueAt as string);

      return app.prisma.task.update({
        where: { id, tenantId: req.tenantId },
        data,
      });
    }
  );

  app.get(
    "/appointments",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      return app.prisma.appointment.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { startAt: "asc" },
        take: 200,
      });
    }
  );

  app.post(
    "/appointments",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = AppointmentCreateSchema.parse(req.body);
      const appt = await app.prisma.appointment.create({
        data: { ...input, tenantId: req.tenantId, userId: req.user.userId },
      });
      return reply.code(201).send(appt);
    }
  );
}
