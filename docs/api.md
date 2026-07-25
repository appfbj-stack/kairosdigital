# API — Referência

Base URL local: `http://localhost:3001/api`
Base URL prod: `https://api.SEU-DOMINIO.com/api`

Todas as rotas (exceto `/auth/*` e `/webhooks/*`) requerem cookie `hermes_token` (setado pelo `POST /auth/login`).

## Auth

### POST /auth/register
Cria tenant + owner.
```json
{ "tenantName":"Empresa", "tenantSlug":"empresa", "ownerName":"João",
  "ownerEmail":"j@e.com", "ownerPassword":"Senha123", "planTier":"BASIC" }
```

### POST /auth/login
```json
{ "email":"j@e.com", "password":"Senha123", "tenantSlug":"empresa" }
```
→ seta cookies `hermes_token` (JWT) e `hermes_refresh`.

### POST /auth/logout
Revoga sessão e limpa cookies.

### GET /auth/me
Retorna o JWT payload do usuário corrente.

---

## Chat IA (SSE)

### POST /chat/stream
```json
{ "message":"Crie um lead chamado João", "conversationId":"...opcional..." }
```
**Response:** `text/event-stream` com eventos:
```
data: {"type":"delta","content":"Cria"}
data: {"type":"delta","content":"ndo"}
data: {"type":"done","conversationId":"uuid","messageId":"uuid","usage":{...}}
data: [DONE]
```

### GET /conversations
Lista as 50 últimas do tenant.

### GET /conversations/:id/messages
Mensagens da conversa em ordem cronológica.

---

## Contatos / CRM

| Método | Path | Descrição |
|---|---|---|
| GET | `/contacts?page=1&perPage=20&search=...` | Lista paginada |
| POST | `/contacts` | Cria contato |
| GET | `/contacts/:id` | Detalhe |
| PATCH | `/contacts/:id` | Atualiza |
| DELETE | `/contacts/:id` | Remove |

## Tarefas / Agenda

| Método | Path |
|---|---|
| GET/POST | `/tasks` |
| GET/POST | `/appointments` |

## WhatsApp

| Método | Path | Descrição |
|---|---|---|
| GET | `/whatsapp/instances` | Lista |
| POST | `/whatsapp/instances` | Cria (respeitando quota do plano) |
| GET | `/whatsapp/instances/:id/qr` | QR Code para conectar |
| DELETE | `/whatsapp/instances/:id` | Remove |
| POST | `/whatsapp/send` | Envia mensagem |

## Usage

### GET /usage
Retorna `{ plan, ai: { used, limit, tokens }, whatsapp: { instances, messages } }`.

---

## Admin (requer SUPERADMIN)

| Path | Descrição |
|---|---|
| `GET /admin/tenants` | Lista todos |
| `POST /admin/tenants/:id/status` body `{ status: "SUSPENDED"\|"ACTIVE" }` |
| `GET /admin/tenants/:id/usage` | Consumo do tenant |
| `GET /admin/metrics` | Métricas globais |
| `GET /admin/logs` | Audit log recente |
| `POST /admin/users/:id/reset-password` body `{ password }` |

---

## Webhooks

### POST /webhooks/evolution
Recebe eventos da Evolution API: `messages.upsert`, `qrcode.updated`, `connection.update`.

---

## Erros

Todo erro retorna:
```json
{ "success": false, "error": { "code": "QUOTA_EXCEEDED", "message": "...", "details": {} } }
```

Códigos comuns: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION_ERROR` (422), `QUOTA_EXCEEDED` (402), `INTERNAL_ERROR` (500).
