# Build do frontend
FROM node:24-alpine AS web-build
WORKDIR /web
COPY barbearia-rei-web/package*.json ./
RUN npm ci
COPY barbearia-rei-web/ ./
RUN npm run build

# Build da API
FROM node:24-alpine AS api-build
WORKDIR /app
COPY barbearia-rei-api/package*.json ./
RUN npm ci
COPY barbearia-rei-api/ ./
RUN npx prisma generate
RUN npm run build

# Runtime — um único container serve a API e o front estático (mesmo
# domínio, sem precisar de nginx/servidor estático separado).
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/dist ./dist
COPY --from=api-build /app/prisma ./prisma
COPY --from=api-build /app/prisma.config.ts ./prisma.config.ts
COPY --from=api-build /app/package.json ./package.json
COPY --from=web-build /web/dist ./web-dist

EXPOSE 3333
CMD ["node", "dist/server.js"]
