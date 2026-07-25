import type { FastifyInstance } from "fastify";
import { requireTenant } from "../middleware/tenant.js";
import { getUsageSummary } from "../services/billing.service.js";

export async function usageRoutes(app: FastifyInstance) {
  app.get(
    "/usage",
    { preHandler: [app.authenticate, requireTenant] },
    async (req) => getUsageSummary(req.tenantId)
  );
}
