# Kairos Digital — CRM Inteligente com WhatsApp (Evolution GO) + Hermes AI

SaaS multi-tenant white-label para **imobiliárias, mecânicas, varejo, clínicas, salões, escolas e serviços gerais**.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        KAIROS DIGITAL                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Evolution   │  │   Hermes     │  │    PostgreSQL        │  │
│  │     GO       │◄─►│   Agent      │◄─►│   (Prisma + pgvector)│  │
│  │ (WhatsApp)   │  │  (Tools CRM) │  │   Multi-tenant RLS   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         ▲                ▲                      ▲               │
│         │                │                      │               │
│  ┌──────┴──────┐  ┌──────┴──────┐      ┌────────┴────────┐     │
│  │   Bridge    │  │   CRM API   │      │   Frontend      │     │
│  │  (Webhook)  │  │  (NestJS)   │      │  (Next.js)      │     │
│  └─────────────┘  └─────────────┘      └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos
- Docker + Docker Compose
- Evolution GO rodando em `http://evogo-api:8080` (rede `evogo_evogo-network`)
- Hermes Agent rodando em `http://hermes-workspace-hermes-agent-1:8642` (rede `hermes-workspace_default`)

### 1. Clone e configure
```bash
git clone https://github.com/appfbj-stack/kairosdigital.git
cd kairosdigital
cp .env.example .env
# Edite .env com suas chaves
```

### 2. Suba tudo
```bash
docker compose up -d --build
```

### 3. Migrações + Seed
```bash
docker compose exec crm-api npx prisma migrate deploy
docker compose exec crm-api npx prisma db seed
```

### 4. Acesse
- **Frontend (Painel Cliente):** http://localhost:3000
- **API (Swagger):** http://localhost:3001/api
- **Bridge:** http://localhost:3000/webhook/whatsapp

## 🔐 Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL=postgresql://kairos:Kairos2026!@postgres:5432/kairosdigital
POSTGRES_PASSWORD=Kairos2026!

# Evolution GO
EVOLUTION_API_URL=http://evogo-api:8080
EVOLUTION_GLOBAL_KEY=sua_global_key_aqui

# Bridge Hermes
BRIDGE_URL=http://hermes-evolution-bridge:3000

# Auth
JWT_SECRET=gere_uma_chave_forte_com_openssl_rand_base64_32

# Frontend
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_WS_URL=wss://api.seudominio.com
```

## 🧪 Tenants de Demo (seed)

| Slug | Vertical | Email | Senha |
|------|----------|-------|-------|
| `demo-imobiliaria` | REAL_ESTATE | joao@demoimoveis.com | demo123 |
| `demo-mecanica` | AUTOMOTIVE | carlos@demoauto.com | demo123 |
| `demo-loja` | RETAIL | maria@demofashion.com | demo123 |

## 📦 Estrutura do Projeto

```
kairosdigital/
├── docker-compose.yml          # Orquestração completa
├── .env.example
├── prisma/
│   ├── schema.prisma           # Schema multi-tenant + vertical
│   └── seed.ts                 # 3 tenants demo + KB
├── apps/
│   ├── api/                    # NestJS (CRM API + WhatsApp)
│   │   ├── src/
│   │   │   ├── auth/           # JWT + multi-tenant guard
│   │   │   ├── tenants/        # CRUD + verticalConfig
│   │   │   ├── whatsapp/       # Evolution GO integration
│   │   │   ├── leads/          # Leads + qualificação
│   │   │   ├── deals/          # Pipeline + funil
│   │   │   ├── tasks/          # Follow-ups automáticos
│   │   │   ├── conversations/  # Histórico chat
│   │   │   ├── knowledge/      # KB + pgvector
│   │   │   └── templates/      # Templates WhatsApp
│   │   └── Dockerfile
│   └── frontend/               # Next.js 14 (App Router)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/login/
│       │   │   ├── (dashboard)/painel/
│       │   │   │   ├── page.tsx      # WhatsAppConnect + ChatWidget + LeadsList
│       │   │   │   └── components/
│       │   │   └── api/              # Proxy para CRM API
│       │   ├── components/
│       │   │   ├── WhatsAppConnect.tsx
│       │   │   ├── ChatWidget.tsx
│       │   │   └── LeadsList.tsx
│       │   └── lib/
│       │       ├── api.ts            # Axios + interceptors
│       │       ├── store.ts          # Zustand (token + tenant)
│       │       └── utils.ts
│       └── Dockerfile
├── bridge/                     # Hermes ↔ Evolution (já existe no seu VPS)
│   └── server.js
├── hermes-tools/
│   └── crm-tools.ts            # 20 functions pro Hermes
└── docs/
    ├── VERTICAIS.md
    ├── PROMPTS.md
    └── DEPLOY.md
```

## 🎯 Funcionalidades por Vertical

### Imobiliária (REAL_ESTATE)
- **Campos Lead:** orçamento, tipo imóvel, quartos, localização, financiamento, urgência
- **Pipeline:** Novo → Qualificação → Agendou Visita → Fez Proposta → Negociação → Fechado ✓ / Perdido
- **Templates:** boas_vindas, agendamento_visita, proposta
- **KB:** financiamento, documentação, bairros, condomínios

### Mecânica (AUTOMOTIVE)
- **Campos Lead:** marca, modelo, ano, placa, serviço, quilometragem
- **Pipeline:** Novo → Diagnóstico → Orçamento → Aprovado → Em Execução → Pronto ✓ / Não Aprovado
- **Templates:** boas_vindas, orcamento, pronto
- **KB:** serviços, peças, garantia, manutenção preventiva, preços

### Varejo (RETAIL)
- **Campos Lead:** categoria, tamanho, cor, orçamento, ocasião
- **Pipeline:** Novo → Interesse → Carrinho → Pagamento → Entregue ✓ / Cancelado
- **Templates:** boas_vindas, carrinho, entrega
- **KB:** produtos, trocas, entregas, promoções, tamanhos

## 🤖 Hermes Tools (20 functions)

| Categoria | Functions |
|-----------|-----------|
| Leads | `create_lead`, `get_lead`, `list_leads`, `update_lead`, `qualify_lead` |
| Deals | `create_deal`, `get_deal`, `list_deals`, `move_deal_stage`, `close_deal` |
| Tasks | `create_task`, `list_tasks`, `complete_task` |
| Conversas | `get_conversation_history` |
| KB | `search_kb`, `add_kb` |
| WhatsApp | `send_whatsapp_text`, `send_whatsapp_template` |

## 🌐 Deploy Produção (Dokploy)

1. Crie 3 apps no Dokploy:
   - `kairos-api` → `Dockerfile.api` → porta 3001
   - `kairos-frontend` → `Dockerfile.frontend` → porta 3000
   - `kairos-bridge` → `bridge/Dockerfile` → porta 3000

2. Networks externas obrigatórias:
   ```yaml
   networks:
     hermes_net: { external: true, name: hermes-workspace_default }
     evogo_net: { external: true, name: evogo_evogo-network }
   ```

3. Domínios:
   - `api.seudominio.com` → `kairos-api:3001`
   - `crm.seudominio.com` → `kairos-frontend:3000`
   - Configure SSL Let's Encrypt

4. Webhook Evolution GO:
   - No manager: `https://api.seudominio.com/webhook/whatsapp`
   - Events: `MESSAGE`, `CONNECTION`, `QRCODE`

## 🧑‍💻 Desenvolvimento Local

```bash
# API
cd apps/api
npm install
npm run start:dev

# Frontend
cd apps/frontend
npm install
npm run dev

# Prisma Studio
npx prisma studio
```

## 📚 Documentação

- [Verticais e Configuração](docs/VERTICAIS.md)
- [Prompts do Hermes](docs/PROMPTS.md)
- [Deploy Completo](docs/DEPLOY.md)

## 🔒 Segurança

- JWT com expiração 24h + refresh
- Row Level Security via `tenantId` em todas queries
- Webhook secret validation
- Rate limiting (configurar no Traefik/Nginx)
- CORS restrito aos domínios dos tenants

## 📄 Licença

MIT — Use, modifique, venda como SaaS white-label.