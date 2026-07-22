# Não é um servidor — só builda os estáticos. O nginx do host (ou outro
# container de proxy) serve o resultado a partir do volume montado em
# /app/dist (ver docker-compose.yml, serviço "web").
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "build"]
