#!/bin/bash
set -e

VPS="root@31.97.160.94"
DOMAIN="rei.impulsiodigital.com"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_LOCAL="$PROJECT_DIR/barbearia-rei-api"
WEB_LOCAL="$PROJECT_DIR/barbearia-rei-web"

echo "======================================"
echo "  DEPLOY - Barbearia do Rei"
echo "======================================"

echo ""
echo "[1/6] Build do painel..."
(cd "$WEB_LOCAL" && npm ci && npm run build)

echo ""
echo "[2/6] Enviando API para o VPS..."
rsync -avz --checksum \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  "$API_LOCAL/" "$VPS:/var/www/barbearia/api/"

echo ""
echo "[3/6] Enviando frontend (dist) para o VPS..."
rsync -avz --checksum \
  "$WEB_LOCAL/dist/" "$VPS:/var/www/barbearia/web/dist/"

echo ""
echo "[4/6] Build da API + Backup + Migrations + PM2..."
ssh "$VPS" bash << 'REMOTE'
  set -e

  cd /var/www/barbearia/api

  echo "  → Instalando dependências..."
  npm ci

  echo "  → Gerando Prisma client..."
  npx prisma generate

  echo "  → Build TypeScript..."
  npm run build

  echo "  → Backup dos bancos (antes das migrations)..."
  npm run db:backup:all

  echo "  → Rodando migrations..."
  npm run db:deploy:all

  echo "  → Configurando PM2..."
  if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
  fi

  # reload mantém o processo registrado; start só na primeira instalação.
  # Fica em modo fork (uma instância): em cluster o worker de notificações duplicaria envios.
  pm2 reload barbearia-api --update-env 2>/dev/null \
    || pm2 start dist/server.js --name barbearia-api
  pm2 save
  pm2 startup systemd -u root --hp /root 2>/dev/null || true
REMOTE

echo ""
echo "[5/6] Configurando Nginx + SSL..."
ssh "$VPS" DOMAIN="$DOMAIN" bash << 'REMOTE'
  # Instalar Certbot se necessário
  if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
  fi

  cat > /etc/nginx/sites-available/barbearia << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend React
    root /var/www/barbearia/web/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3334;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINX

  # Ativar site
  ln -sf /etc/nginx/sites-available/barbearia /etc/nginx/sites-enabled/barbearia

  # Remover default se existir
  rm -f /etc/nginx/sites-enabled/default

  # Testar e recarregar nginx
  nginx -t && systemctl reload nginx

  # Gerar certificado SSL
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@impulsiodigital.com --redirect
REMOTE

echo ""
echo "[6/6] Verificando status..."
ssh "$VPS" bash << 'REMOTE'
  echo "  → PM2:"
  pm2 list
  echo ""
  echo "  → Nginx:"
  systemctl status nginx --no-pager | head -5
REMOTE

echo ""
echo "======================================"
echo "  DEPLOY CONCLUÍDO!"
echo "  Acesse: https://rei.impulsiodigital.com"
echo "======================================"
