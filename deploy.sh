#!/bin/bash
# Deploy do Seu Barbeiro na VPS Contabo (Docker + Easypanel/Traefik).
# Primeira instalação: ADMIN_EMAIL=voce@exemplo.com ./deploy.sh
# Demais deploys:      ./deploy.sh
set -euo pipefail

VPS="${VPS:-impulsio}" # alias do ~/.ssh/config → root@173.212.208.109
REMOTE_DIR="/opt/seu-barbeiro"
APP_DOMAIN="seubarbeiro.impulsiodigital.com"
# Domínio anterior: continua no ar redirecionando para o novo (links já compartilhados).
OLD_DOMAIN="rei.impulsiodigital.com"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "======================================"
echo "  DEPLOY - Seu Barbeiro"
echo "======================================"

echo ""
echo "[1/3] Enviando código para $VPS:$REMOTE_DIR..."
ssh "$VPS" "mkdir -p $REMOTE_DIR"
# .env e backups ficam só no servidor (excluídos também do --delete).
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude 'backups' \
  --exclude '.claude' \
  --exclude 'Fotos_seu_barbeiro' \
  --exclude 'agenda-demo.png' \
  "$PROJECT_DIR/" "$VPS:$REMOTE_DIR/"

echo ""
echo "[2/3] Backup, build e subida dos containers..."
ssh "$VPS" REMOTE_DIR="$REMOTE_DIR" APP_DOMAIN="$APP_DOMAIN" \
  OLD_DOMAIN="$OLD_DOMAIN" ADMIN_EMAIL="${ADMIN_EMAIL:-}" bash << 'REMOTE'
  set -euo pipefail
  cd "$REMOTE_DIR"

  FIRST=0
  if [ ! -f .env ]; then
    if [ -z "$ADMIN_EMAIL" ]; then
      echo "  ✗ Primeira instalação: rode ADMIN_EMAIL=voce@exemplo.com ./deploy.sh" >&2
      exit 1
    fi
    echo "  → Primeira instalação: gerando .env com senhas aleatórias..."
    umask 077
    cat > .env << EOF
APP_DOMAIN=$APP_DOMAIN
OLD_DOMAIN=$OLD_DOMAIN
FRONTEND_URL=https://$APP_DOMAIN
PUBLIC_WEB_URL=https://$APP_DOMAIN
POSTGRES_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
DEFAULT_SALON=seu-barbeiro
SALON_TIMEZONE=America/Sao_Paulo
NOTIFICATION_WORKER=true
SHOP_NAME="Seu Barbeiro"
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20)
EOF
    FIRST=1
  fi

  if [ -n "$(docker compose ps -q postgres 2>/dev/null)" ]; then
    echo "  → Backup do banco..."
    mkdir -p backups && chmod 700 backups
    # < /dev/null: o exec não pode consumir o restante deste script (vem pelo stdin).
    docker compose exec -T postgres pg_dump -U seubarbeiro -d seu_barbeiro --no-owner < /dev/null \
      | gzip > "backups/seu-barbeiro-$(date +%Y%m%d-%H%M%S).sql.gz"
    ls -1t backups/*.sql.gz | tail -n +11 | xargs -r rm -f
  fi

  echo "  → Build e subida (migrações rodam na inicialização do app)..."
  docker compose up -d --build

  echo "  → Aguardando o app ficar saudável..."
  for i in $(seq 1 60); do
    STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q app)" 2>/dev/null || echo starting)
    [ "$STATUS" = healthy ] && break
    if [ "$i" = 60 ] || [ "$STATUS" = unhealthy ]; then
      echo "  ✗ App não ficou saudável ($STATUS). Últimos logs:" >&2
      docker compose logs --tail 60 app >&2
      exit 1
    fi
    sleep 3
  done
  echo "  ✓ App saudável"

  if [ "$FIRST" = 1 ]; then
    echo "  → Criando o acesso do dono..."
    docker compose exec -T app npm run db:seed < /dev/null
    PASS=$(grep '^ADMIN_PASSWORD=' .env | cut -d= -f2-)
    umask 077
    printf 'Seu Barbeiro — acesso inicial\nURL: https://%s/login\nSalão: seu-barbeiro\nE-mail: %s\nSenha: %s\n' \
      "$APP_DOMAIN" "$ADMIN_EMAIL" "$PASS" > /root/seu-barbeiro-acesso-inicial.txt
    # A senha não fica no .env nem no ambiente do container.
    sed -i '/^ADMIN_PASSWORD=/d' .env
    docker compose up -d
    echo "  ✓ Acesso inicial salvo em /root/seu-barbeiro-acesso-inicial.txt"
  fi
REMOTE

echo ""
echo "[3/3] Verificando..."
ssh "$VPS" "cd $REMOTE_DIR && docker compose ps"

echo ""
echo "======================================"
echo "  DEPLOY CONCLUÍDO!"
echo "  Acesse: https://$APP_DOMAIN"
echo "======================================"
