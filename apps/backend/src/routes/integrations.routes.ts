import { FastifyInstance } from "fastify";
import { mercadolivreService } from "../services/mercadolivre.service.js";

export async function integrationsRoutes(app: FastifyInstance) {
  app.get("/integrations/mercadolivre/auth-url", async (req, reply) => {
    const { tenantId } = req.query as { tenantId?: string };
    if (!tenantId) {
      return reply.status(400).send({ error: "tenantId e obrigatorio" });
    }
    const url = mercadolivreService.getAuthUrl(tenantId);
    return { url };
  });

  app.get("/integrations/mercadolivre/callback", async (req, reply) => {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code) {
      return reply.status(400).send({ error: "code ausente na callback" });
    }
    const tenantId = state;
    if (!tenantId) {
      return reply.status(400).send({ error: "state (tenantId) ausente na callback" });
    }

    try {
      const result = await mercadolivreService.handleCallback(tenantId, code);

      return reply.type("text/html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Mercado Livre — Conectado</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5}div{text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.1)}h1{color:#00a650}span{color:#666}</style></head>
<body><div><h1>Conectado com sucesso!</h1><p>Conta do Mercado Livre <strong>${result.meliNickname ?? result.meliUserId}</strong> vinculada ao Hermes.</p><span>Pode fechar esta janela e voltar ao chat.</span></div></body></html>`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      return reply.status(400).send({ error: message });
    }
  });

  app.get("/integrations/mercadolivre/status", async (req, reply) => {
    const { tenantId } = req.query as { tenantId?: string };
    if (!tenantId) {
      return reply.status(400).send({ error: "tenantId e obrigatorio" });
    }
    return mercadolivreService.getStatus(tenantId);
  });

  app.delete("/integrations/mercadolivre/disconnect", async (req, reply) => {
    const { tenantId } = req.query as { tenantId?: string };
    if (!tenantId) {
      return reply.status(400).send({ error: "tenantId e obrigatorio" });
    }
    await mercadolivreService.disconnect(tenantId);
    return { ok: true };
  });
}
