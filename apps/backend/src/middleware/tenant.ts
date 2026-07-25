import type { FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "@hermes/utils";

declare module "fastify" {
  interface FastifyRequest {
    tenantId: string;
  }
}

/**
 * Garante que a request tem um tenantId válido (não-superadmin).
 * Superadmin pode passar `X-Tenant-Id` header para operar em qualquer tenant.
 */
export async function requireTenant(req: FastifyRequest) {
  if (!req.user) throw new UnauthorizedError();

  if (req.user.role === "SUPERADMIN") {
    const header = req.headers["x-tenant-id"];
    if (typeof header === "string" && header.length > 0) {
      req.tenantId = header;
      return;
    }
    if (req.user.tenantId) {
      req.tenantId = req.user.tenantId;
      return;
    }
    throw new ForbiddenError("Superadmin deve informar X-Tenant-Id");
  }

  if (!req.user.tenantId) {
    throw new ForbiddenError("Usuário sem tenant associado");
  }
  req.tenantId = req.user.tenantId;
}
