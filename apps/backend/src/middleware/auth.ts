import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError, ForbiddenError } from "@kairosdigital/utils";

export async function authenticate(req: FastifyRequest, _reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    throw new UnauthorizedError("Token inválido ou ausente");
  }
}

export function requireRole(...roles: Array<"SUPERADMIN" | "OWNER" | "ADMIN" | "MEMBER" | "VIEWER">) {
  return async (req: FastifyRequest) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError(`Requer role: ${roles.join(",")}`);
  };
}

export const requireSuperadmin = requireRole("SUPERADMIN");
export const requireAdmin = requireRole("SUPERADMIN", "OWNER", "ADMIN");
