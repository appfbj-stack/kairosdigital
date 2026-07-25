# Deploy — Dokploy + GitHub

## Pré-requisitos

- VPS Ubuntu 22.04+ com root
- Domínio com DNS gerenciável
- Conta GitHub com o repo `appfbj-stack/saas-agente-watzap`
- API Key OpenRouter (https://openrouter.ai)

## 1. Bootstrap VPS

```bash
ssh root@5.161.255.231
curl -fsSL https://raw.githubusercontent.com/appfbj-stack/saas-agente-watzap/main/scripts/setup-vps.sh | bash
```

Após o script:
- Docker instalado
- Firewall (ufw) com 22, 80, 443, 3000
- Swap 2GB
- Dokploy instalado em http://5.161.255.231:3000

## 2. Configurar GitHub no Dokploy

1. Em Dokploy → Settings → Git Providers → conectar GitHub
2. Autorizar o repo `appfbj-stack/saas-agente-watzap`

## 3. Criar a stack

1. Projects → New Project → "Hermes OS"
2. Application → New → **Docker Compose**
3. Source: GitHub → `appfbj-stack/saas-agente-watzap` · branch `main`
4. Compose path: `docker-compose.yml`
5. Environment → cole TODAS as variáveis do `.env.example` e preencha valores reais
6. Domains (por serviço):
   - **frontend**: `app.SEU-DOMINIO.com` · porta 3000 · HTTPS automático
   - **admin**: `admin.SEU-DOMINIO.com` · porta 3000
   - **backend**: `api.SEU-DOMINIO.com` · porta 3001
   - **evolution**: `wa.SEU-DOMINIO.com` · porta 8080 (opcional, mantenha privado)
7. DNS — criar registros A apontando para `5.161.255.231`
8. Deploy

O Dokploy gera certificados Let's Encrypt automaticamente via Traefik.

## 4. Migrar banco (primeira vez)

O Dockerfile do backend já roda `prisma migrate deploy` no `CMD`. Para forçar manualmente:

```bash
docker exec -it hermes-backend pnpm prisma migrate deploy
docker exec -it hermes-backend pnpm prisma db seed
```

## 5. Auto-deploy

Em Dokploy → Application → Auto-deploy → **enable**. A cada `git push origin main`, o Dokploy:
1. Recebe webhook
2. Rebuilda apenas as imagens alteradas
3. Sobe novos containers com health-check
4. Faz rolling switch sem downtime

## 6. Backup

Adicionar cron no host:

```bash
sudo crontab -e
0 3 * * * /opt/hermes-os/scripts/backup.sh >> /var/log/hermes-backup.log 2>&1
```

## Troubleshooting

**Backend não conecta no Postgres**: verifique `DATABASE_URL` no env do Dokploy — deve usar hostname `postgres` (nome do service), não `localhost`.

**Evolution não cria instância**: confira `EVOLUTION_API_KEY` igual no backend e no evolution.

**SSL não emite**: DNS ainda não propagou, ou domínio aponta para outro IP.

**Chat IA não responde**: cheque `OPENROUTER_API_KEY` válida e crédito na conta OpenRouter.
