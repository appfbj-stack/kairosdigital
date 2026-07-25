#!/usr/bin/env bash
# ============================================
# Hermes OS — Bootstrap VPS Ubuntu (rodar uma vez)
# Uso: curl -fsSL https://raw.githubusercontent.com/appfbj-stack/saas-agente-watzap/main/scripts/setup-vps.sh | bash
# ============================================
set -euo pipefail

echo "🚀 Iniciando setup VPS para Hermes OS"

# ---- Update ----
sudo apt update && sudo apt -y upgrade

# ---- Pacotes essenciais ----
sudo apt -y install curl wget git ufw fail2ban htop jq unzip ca-certificates gnupg

# ---- Docker ----
if ! command -v docker &> /dev/null; then
  echo "📦 Instalando Docker…"
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
fi

# ---- Docker Compose plugin (já vem com docker-ce moderno) ----
docker compose version || sudo apt -y install docker-compose-plugin

# ---- Firewall ----
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp   # Dokploy UI
sudo ufw --force enable

# ---- Swap (recomendado para VPS pequenas) ----
if ! swapon --show | grep -q '/swapfile'; then
  echo "💾 Criando swap 2GB…"
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# ---- Dokploy ----
if ! docker ps --format '{{.Names}}' | grep -q dokploy; then
  echo "🎛  Instalando Dokploy…"
  curl -sSL https://dokploy.com/install.sh | sh
else
  echo "✓ Dokploy já instalado"
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Acesse o painel Dokploy: http://5.161.255.231:3000"
echo "  2. Crie/abra o projeto 'hermes-os'"
echo "  3. Adicione o repositório: https://github.com/appfbj-stack/saas-agente-watzap.git"
echo "  4. Configure as variáveis do .env.example no Dokploy"
echo "  5. Aponte seus domínios (DNS A → IP da VPS) e deixe o Traefik do Dokploy emitir os SSL"
