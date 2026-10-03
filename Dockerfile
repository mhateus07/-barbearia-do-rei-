# Build do painel
FROM node:24-alpine AS web-build
WORKDIR /web
COPY seu-barbeiro-web/package*.json ./
RUN npm ci
COPY seu-barbeiro-web/ ./
RUN npm run build

# Build da API
FROM node:24-alpine AS api-build
WORKDIR /app
COPY seu-barbeiro-api/package*.json ./
RUN npm ci
COPY seu-barbeiro-api/ ./
RUN npx prisma generate && npm run build

# Runtime: um container serve a API e o painel no mesmo domínio.
# node_modules inclui o CLI do Prisma (migrações) e o ts-node (seed).
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    WEB_DIST=/app/web-dist
COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/dist ./dist
COPY --from=api-build /app/prisma ./prisma
COPY --from=api-build /app/scripts ./scripts
COPY --from=api-build /app/prisma.config.ts /app/tsconfig.json /app/package.json ./
COPY --from=web-build /web/dist ./web-dist
EXPOSE 3333
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "npm run db:deploy:all && node dist/server.js"]
