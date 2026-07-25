# Hermes OS

> **Sistema Operacional Empresarial com IA** — SaaS multi-tenant que une chat IA conversacional, CRM, WhatsApp multi-instância, agenda, follow-up e automações em uma única plataforma.

Você conversa com o sistema em linguagem natural:

> "Crie um lead chamado João, telefone +5511999998888"  
> "Agende reunião amanhã às 14h com a Maria"  
> "Envie follow-up para clientes sem resposta há 7 dias"  
> "Mostre meu consumo de IA este mês"

E o **Hermes** (agente orquestrador) entende, chama a ferramenta certa, e devolve a resposta.

---

## 🏗 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) · React 18 · Tailwind · PWA-ready |
| Admin | Next.js 14 (painel super-admin separado) |
| Backend | Node.js 20 · Fastify 5 · Prisma 5 · WebSocket |
| Workers | BullMQ (Redis) · workers de follow-up, whatsapp, usage |
| Banco | PostgreSQL 16 |
| Cache/Fila | Redis 7 |
| IA | OpenRouter (DeepSeek V3 padrão · fallback Claude Haiku & GPT-4o-mini) |
| WhatsApp | Evolution API v2 (Baileys) · suporte futuro Uazapi |
| Orquestração | Docker Compose · Dokploy (Traefik + SSL automático) |
| Deploy | GitHub → Dokploy (auto-deploy via webhook) |

---

## 📁 Estrutura

```
hermes-os/
├── apps/
│   ├── frontend/       # Next.js — chat IA + CRM + agenda (porta 3000)
│   ├── admin/          # Next.js — painel super admin (porta 3002)
│   ├── backend/        # Fastify API + Prisma + OpenRouter (porta 3001)
│   └── workers/        # BullMQ workers (follow-up, whatsapp, usage)
├── packages/
│   ├── types/          # Schemas Zod compartilhados
│   ├── utils/          # bcrypt, jwt helpers, errors, logger
│   ├── ui/             # Componentes React (Button, Input, Card, Badge)
│   └── agents/         # CrmAgent, AgendaAgent, WhatsAppAgent, etc.
├── docker/             # nginx.conf, init.sql do Postgres
├── scripts/            # setup-vps.sh, backup.sh
├── .github/workflows/  # CI + deploy
├── docker-compose.yml  # Stack completa para Dokploy
└── .env.example        # Todas as variáveis (preencher antes do deploy)
```

---

## 🧠 Agentes IA

| Agente | Função |
|---|---|
| **Orquestrador** | Cérebro central — escolhe o agente especialista |
| **CRM** | Cria/atualiza/busca contatos, move estágios |
| **Agenda** | Cria tarefas e compromissos com fuso do tenant |
| **WhatsApp** | Envia mensagens, gerencia instâncias |
| **Follow-up** | Cadência D+1/D+3/D+7 para leads inativos |
| **Financeiro** | Mostra consumo, plano, alerta limites |
| **Suporte** | Onboarding, troubleshooting, abre tickets |
| **DevOps** | Monitora containers, reinicia instâncias (super admin) |
| **Automação** | Cria automações por trigger em linguagem natural |

---

## 🚀 Deploy na VPS via Dokploy

Sua VPS de produção: **5.161.255.231** · Dokploy em **http://5.161.255.231:3000**

### 1. Setup inicial da VPS (rodar uma vez)

```bash
ssh root@5.161.255.231
curl -fsSL https://raw.githubusercontent.com/appfbj-stack/saas-agente-watzap/main/scripts/setup-vps.sh | bash
```

Isso instala Docker, configura firewall, swap e o Dokploy.

### 2. Configurar no Dokploy

1. Abrir http://5.161.255.231:3000
2. Criar projeto **Hermes OS**
3. Adicionar aplicação tipo **Docker Compose**
4. Apontar para o repositório: `https://github.com/appfbj-stack/saas-agente-watzap.git`
5. Branch: `main`
6. Caminho do compose: `docker-compose.yml`
7. Copiar `.env.example` → preencher todas as chaves reais no painel de Environment do Dokploy:
   - `OPENROUTER_API_KEY` (criar conta em https://openrouter.ai)
   - `JWT_SECRET` (gerar com `openssl rand -hex 32`)
   - `COOKIE_SECRET`
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`
   - `EVOLUTION_API_KEY` (gerar uuid)
   - `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`
8. **Domínios** (em cada serviço, aba Domains):
   - `frontend` → `app.seu-dominio.com` (porta 3000)
   - `admin` → `admin.seu-dominio.com` (porta 3000)
   - `backend` → `api.seu-dominio.com` (porta 3001)
9. Apontar DNS (A) dos domínios para `5.161.255.231`
10. Clicar **Deploy** — o Dokploy cuida do build, do Traefik e do Let's Encrypt automaticamente.

### 3. Deploy automático

Cada `git push origin main` → GitHub avisa Dokploy → Dokploy refaz build e troca containers sem downtime.

---

## 💻 Desenvolvimento local

```bash
git clone https://github.com/appfbj-stack/saas-agente-watzap.git hermes-os
cd hermes-os
cp .env.example .env             # preencher
pnpm install
pnpm db:migrate:dev              # cria schema no Postgres
pnpm db:seed                     # cria planos + superadmin + tenant demo
pnpm dev                         # roda turbo: backend + frontend + admin + workers
```

URLs locais:
- Frontend → http://localhost:3000
- Admin    → http://localhost:3002
- API      → http://localhost:3001
- Evolution → http://localhost:8080

Login demo: `owner@demo.local` / `Demo123!`

---

## 📊 Planos & Limites

| Plano | Mensagens IA / mês | Instâncias WhatsApp | Usuários |
|---|---|---|---|
| Básico | 1.500 | 2 | 3 |
| Pro | 3.500 | 5 | 10 |
| Business | 10.000 | 10 | 30 |

Quando o tenant excede o limite, recebe `402 QUOTA_EXCEEDED` na API e o chat bloqueia novas mensagens IA até upgrade ou reset do período.

---

## 🔐 Segurança

- JWT em cookie httpOnly + secret rotacionável
- RBAC: `SUPERADMIN` · `OWNER` · `ADMIN` · `MEMBER` · `VIEWER`
- Multi-tenant via `req.tenantId` (middleware obriga em toda rota de tenant)
- Rate limit global por IP+userId (Redis)
- Helmet, CORS configurável, sanitização Zod em todo input
- Webhooks Evolution validados por origem + secret (HMAC opcional)
- Audit log de todas as ações sensíveis

---

## 📚 Documentação

- [docs/architecture.md](docs/architecture.md) — diagrama, fluxos, decisões
- [docs/deployment.md](docs/deployment.md) — deploy detalhado Dokploy
- [docs/api.md](docs/api.md) — referência REST e SSE

---

## 📄 Licença

Privado — uso restrito do proprietário.
