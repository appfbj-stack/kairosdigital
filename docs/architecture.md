# Hermes OS — Arquitetura

## Visão geral

```
                           ┌─────────────────────┐
                           │     CLIENTE WEB     │
                           │ Next.js (3000)      │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐    ┌──────────────────┐
                           │  BACKEND (Fastify)  │◄───┤  ADMIN PANEL     │
                           │      :3001          │    │  Next.js (3002)  │
                           │  - JWT + RBAC       │    └──────────────────┘
                           │  - Multi-tenant     │
                           │  - SSE Chat IA      │
                           │  - REST + WebSocket │
                           └──┬───┬──────────┬───┘
                              │   │          │
                ┌─────────────┘   │          └──────────────┐
                │                 │                          │
        ┌───────▼──────┐  ┌───────▼──────┐         ┌────────▼────────┐
        │  PostgreSQL  │  │   Redis      │         │  OpenRouter     │
        │   (Prisma)   │  │ Cache+BullMQ │         │  DeepSeek/Claude│
        └──────────────┘  └───────┬──────┘         └─────────────────┘
                                  │
                          ┌───────▼──────┐
                          │   WORKERS    │
                          │ followup,    │
                          │ whatsapp,    │
                          │ usage        │
                          └───────┬──────┘
                                  │
                          ┌───────▼──────┐
                          │ Evolution API│
                          │  (WhatsApp)  │
                          └──────────────┘
```

## Fluxo de chat IA

1. Usuário envia mensagem → `POST /api/chat/stream`
2. Backend: verifica JWT + tenantId, valida quota (`ensureAiQuota`)
3. Persiste mensagem INBOUND no Postgres
4. Carrega histórico (últimas 20 msgs da conversation)
5. Chama OpenRouter com `stream: true` (DeepSeek por padrão)
6. Para cada delta SSE → envia ao cliente via `text/event-stream`
7. Ao terminar → persiste resposta OUTBOUND + AiUsage (tokens)
8. Cliente acumula deltas em `ChatInterface.tsx`

## Multi-tenant

- Todo modelo de domínio tem `tenantId`
- Middleware `requireTenant` injeta `req.tenantId` em qualquer rota tenant
- Superadmin pode passar `X-Tenant-Id` para operar como tenant qualquer
- Cascade delete em `Tenant` → remove tudo do tenant (LGPD)

## Agentes IA

Os agentes vivem em `packages/agents`. Cada um é uma classe que estende `BaseAgent` com:
- `systemPrompt` — comportamento
- `tools[]` — schemas Zod + handlers

Em runtime, o backend "monta" cada tool injetando o Prisma + services. O Orquestrador recebe TODAS as tools e o LLM (via function calling do OpenRouter) decide qual chamar.

## Filas (BullMQ)

| Fila | Quem produz | Worker |
|---|---|---|
| `followup` | Service + cron | Cria tarefas D+1/D+3/D+7 |
| `whatsapp` | API send + automation | Envia via Evolution |
| `usage` | Chat service | Agrega AiUsage / MessageUsage |
| `ai` | Reservado | Chamadas longas (resumo, embed) |

## Webhooks

- `POST /api/webhooks/evolution` — recebe `messages.upsert`, `qrcode.updated`, `connection.update`
- Persiste mensagens INBOUND e atualiza status das instâncias
- Próximo passo: validar HMAC com `EVOLUTION_WEBHOOK_SECRET`
