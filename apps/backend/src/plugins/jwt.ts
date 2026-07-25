import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { env } from "../config/env.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: string;
      tenantId: string | null;
      role: "SUPERADMIN" | "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
      email: string;
    };
    user: {
      userId: string;
      tenantId: string | null;
      role: "SUPERADMIN" | "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
      email: string;
    };
  }
}

export async function registerJwt(app: FastifyInstance) {
  await app.register(fastifyCookie, { secret: env.COOKIE_SECRET });
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
    cookie: { cookieName: "hermes_token", signed: false },
  });
}
