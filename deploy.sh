#!/bin/bash
set -e

VPS="root@31.97.160.94"
DOMAIN="seubarbeiro.impulsiodigital.com"
# Domínio anterior: continua no ar redirecionando para o novo (links já compartilhados).
OLD_DOMAIN="rei.impulsiodigital.com"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_LOCAL="$PROJECT_DIR/seu-barbeiro-api"
WEB_LOCAL="$PROJECT_DIR/seu-barbeiro-web"

echo "======================================"
echo "  DEPLOY - Seu Barbeiro"
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
  "$API_LOCAL/" "$VPS:/var/www/seu-barbeiro/api/"

echo ""
echo "[3/6] Enviando frontend (dist) para o VPS..."
rsync -avz --checksum \
  "$WEB_LOCAL/dist/" "$VPS:/var/www/seu-barbeiro/web/dist/"

echo ""
echo "[4/6] Build da API + Backup + Migrations + PM2..."
ssh "$VPS" DOMAIN="$DOMAIN" OLD_DOMAIN="$OLD_DOMAIN" bash << 'REMOTE'
  set -e

  # Transição única do nome antigo (/var/www/barbearia, PM2 barbearia-api).
  # O .env não vai pelo rsync: reaproveita o da instalação antiga com o slug novo.
  if [ ! -f /var/www/seu-barbeiro/api/.env ] && [ -f /var/www/barbearia/api/.env ]; then
    echo "  → Migrando .env da instalação antiga..."
    sed 's/barbearia-do-rei/seu-barbeiro/g' /var/www/barbearia/api/.env \
      > /var/www/seu-barbeiro/api/.env
    chmod 600 /var/www/seu-barbeiro/api/.env
  fi
  if [ ! -f /var/www/seu-barbeiro/api/.env ]; then
    echo "  ✗ /var/www/seu-barbeiro/api/.env não encontrado" >&2
    exit 1
  fi
  # FRONTEND_URL (CORS) e PUBLIC_WEB_URL (links enviados) seguem o domínio atual.
  sed -i "s/${OLD_DOMAIN//./\\.}/$DOMAIN/g" /var/www/seu-barbeiro/api/.env

  cd /var/www/seu-barbeiro/api

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
  # O processo antigo ocupa a mesma porta: para antes de subir o novo.
  pm2 delete barbearia-api 2>/dev/null || true
  pm2 reload seu-barbeiro-api --update-env 2>/dev/null \
    || pm2 start dist/server.js --name seu-barbeiro-api
  pm2 save
  pm2 startup systemd -u root --hp /root 2>/dev/null || true
REMOTE

echo ""
echo "[5/6] Configurando Nginx + SSL..."
ssh "$VPS" DOMAIN="$DOMAIN" OLD_DOMAIN="$OLD_DOMAIN" bash << 'REMOTE'
  # Instalar Certbot se necessário
  if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
  fi

  cat > /etc/nginx/sites-available/seu-barbeiro << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend React
    root /var/www/seu-barbeiro/web/dist;
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

server {
    listen 80;
    server_name $OLD_DOMAIN;
    return 301 https://$DOMAIN\$request_uri;
}
NGINX

  # Ativar site
  ln -sf /etc/nginx/sites-available/seu-barbeiro /etc/nginx/sites-enabled/seu-barbeiro
  rm -f /etc/nginx/sites-enabled/barbearia /etc/nginx/sites-available/barbearia

  # Remover default se existir
  rm -f /etc/nginx/sites-enabled/default

  # Testar e recarregar nginx
  nginx -t && systemctl reload nginx

  # Gerar certificado SSL
  certbot --nginx --cert-name seu-barbeiro -d "$DOMAIN" -d "$OLD_DOMAIN" --non-interactive --agree-tos -m admin@impulsiodigital.com --redirect
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
echo "  Acesse: https://$DOMAIN"
echo "======================================"
