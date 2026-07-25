import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";
import { registerJwt } from "./plugins/jwt.js";
import { authenticate } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { contactsRoutes } from "./routes/contacts.routes.js";
import { tasksRoutes } from "./routes/tasks.routes.js";
import { pipelineRoutes } from "./routes/pipeline.routes.js";
import { whatsappRoutes } from "./routes/whatsapp.routes.js";
import { webhookRoutes } from "./routes/webhooks.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { usageRoutes } from "./routes/usage.routes.js";
import { integrationsRoutes } from "./routes/integrations.routes.js";
import { HermesError } from "@hermes/utils";
import { ZodError } from "zod";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: typeof authenticate;
    prisma: typeof prisma;
    redis: typeof redis;
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
    },
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // ---- core ----
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGINS === "*" ? true : env.CORS_ORIGINS.split(","),
    credentials: true,
  });
  await app.register(sensible);
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    redis,
    keyGenerator: (req) => `${req.ip}:${(req as any).user?.userId ?? "anon"}`,
  });
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  await app.register(websocket);
  await registerJwt(app);

  app.decorate("authenticate", authenticate);
  app.decorate("prisma", prisma);
  app.decorate("redis", redis);

  // ---- error handler ----
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(422).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details: err.flatten() },
      });
    }
    if (err instanceof HermesError) {
      return reply.code(err.statusCode).send({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
      });
    }
    app.log.error(err);
    return reply.code(500).send({
      success: false,
      error: { code: "INTERNAL_ERROR", message: err.message ?? "Erro interno" },
    });
  });

  // ---- health ----
  app.get("/health", async () => ({
    status: "ok",
    name: "hermes-backend",
    version: process.env.npm_package_version ?? "0.1.0",
    ts: new Date().toISOString(),
  }));

  // ---- routes ----
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(chatRoutes);
      await api.register(contactsRoutes);
      await api.register(tasksRoutes);
      await api.register(pipelineRoutes);
      await api.register(whatsappRoutes);
      await api.register(webhookRoutes);
      await api.register(adminRoutes);
      await api.register(usageRoutes);
      await api.register(integrationsRoutes);
    },
    { prefix: "/api" }
  );

  return app;
}
