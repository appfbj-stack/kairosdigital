import type { FastifyInstance } from "fastify";
import { LoginSchema, RegisterTenantSchema } from "@kairosdigital/types";
import { authService } from "../services/auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const input = RegisterTenantSchema.parse(req.body);
    const { tenant, owner } = await authService.registerTenant(input);
    const token = app.jwt.sign({
      userId: owner.id,
      tenantId: tenant.id,
      role: owner.role,
      email: owner.email,
    });
    return reply.code(201).send({ tenant, owner: { id: owner.id, email: owner.email, name: owner.name, role: owner.role }, token });
  });

  app.post("/auth/login", async (req, reply) => {
    const input = LoginSchema.parse(req.body);
    const { user, refreshToken: rt } = await authService.login(input);
    const token = app.jwt.sign({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });
    reply.setCookie("hermes_token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 15,
    });
    return { user, token, refreshToken: rt };
  });

  app.post("/auth/logout", async (req) => {
    // Accept refresh token from body
    const body = req.body as any;
    if (body?.refreshToken) await authService.logout(body.refreshToken);
    return { ok: true };
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => {
    return { user: req.user };
  });
}
