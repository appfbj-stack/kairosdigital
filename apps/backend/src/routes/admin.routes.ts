import type { FastifyInstance } from "fastify";
import { requireSuperadmin } from "../middleware/auth.js";
import { getUsageSummary } from "../services/billing.service.js";

export async function adminRoutes(app: FastifyInstance) {
  // Lista todos os tenants (paginada)
  app.get(
    "/admin/tenants",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async () => {
      return app.prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { users: true, contacts: true, whatsappInstances: true } },
        },
        take: 200,
      });
    }
  );

  app.post<{ Params: { id: string }; Body: { status: "ACTIVE" | "SUSPENDED" } }>(
    "/admin/tenants/:id/status",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async (req) => {
      return app.prisma.tenant.update({
        where: { id: req.params.id },
        data: {
          status: req.body.status,
          suspendedAt: req.body.status === "SUSPENDED" ? new Date() : null,
        },
      });
    }
  );

  // Métricas globais
  app.get(
    "/admin/metrics",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async () => {
      const [tenants, users, contacts, messages, aiMessages, instances] = await Promise.all([
        app.prisma.tenant.count(),
        app.prisma.user.count(),
        app.prisma.contact.count(),
        app.prisma.message.count(),
        app.prisma.aiUsage.count(),
        app.prisma.whatsAppInstance.count(),
      ]);
      return { tenants, users, contacts, messages, aiMessages, whatsappInstances: instances };
    }
  );

  // Usage de um tenant específico
  app.get<{ Params: { id: string } }>(
    "/admin/tenants/:id/usage",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async (req) => getUsageSummary(req.params.id)
  );

  // Logs recentes
  app.get(
    "/admin/logs",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async () => {
      return app.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    }
  );

  // Reset de senha por superadmin
  app.post<{ Params: { id: string }; Body: { password: string } }>(
    "/admin/users/:id/reset-password",
    { preHandler: [app.authenticate, requireSuperadmin] },
    async (req) => {
      const { hashPassword } = await import("@hermes/utils");
      const passwordHash = await hashPassword(req.body.password);
      return app.prisma.user.update({
        where: { id: req.params.id },
        data: { passwordHash },
        select: { id: true, email: true },
      });
    }
  );
}
