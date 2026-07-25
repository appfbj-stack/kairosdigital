import type { FastifyInstance } from "fastify";
import { ContactCreateSchema, ContactUpdateSchema, PaginationSchema } from "@hermes/types";
import { requireTenant } from "../middleware/tenant.js";
import { NotFoundError } from "@hermes/utils";

export async function contactsRoutes(app: FastifyInstance) {
  app.get(
    "/contacts",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const { page, perPage, search } = PaginationSchema.parse(req.query);
      const where = {
        tenantId: req.tenantId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      };
      const [items, total] = await Promise.all([
        app.prisma.contact.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        app.prisma.contact.count({ where }),
      ]);
      return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    }
  );

  app.post(
    "/contacts",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const input = ContactCreateSchema.parse(req.body);
      const contact = await app.prisma.contact.create({
        data: { ...input, tenantId: req.tenantId },
      });
      return reply.code(201).send(contact);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/contacts/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const c = await app.prisma.contact.findFirst({
        where: { id: req.params.id, tenantId: req.tenantId },
      });
      if (!c) throw new NotFoundError("Contato");
      return c;
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/contacts/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => {
      const input = ContactUpdateSchema.parse(req.body);
      const updated = await app.prisma.contact.updateMany({
        where: { id: req.params.id, tenantId: req.tenantId },
        data: input,
      });
      if (updated.count === 0) throw new NotFoundError("Contato");
      return app.prisma.contact.findUnique({ where: { id: req.params.id } });
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/contacts/:id",
    { preHandler: [app.authenticate, requireTenant] },
    async (req, reply) => {
      const deleted = await app.prisma.contact.deleteMany({
        where: { id: req.params.id, tenantId: req.tenantId },
      });
      if (deleted.count === 0) throw new NotFoundError("Contato");
      return reply.code(204).send();
    }
  );
}
