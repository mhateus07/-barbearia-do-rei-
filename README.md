# 💈 Barbearia do Rei — Painel Administrativo

Sistema completo de gestão para barbearia, com painel administrativo web, API REST e banco de dados PostgreSQL.

## Estrutura do Projeto

```
Barbearia do Rei/
├── barbearia-rei-api/   # Backend (Node.js + Express + Prisma + PostgreSQL)
└── barbearia-rei-web/   # Frontend (React + Vite + Tailwind CSS)
```

## Funcionalidades

- **Dashboard** — Resumo do dia: agendamentos, receita, próximos horários
- **Agendamentos** — Criação, listagem, atualização de status, filtros por data e barbeiro
- **Clientes** — Cadastro com busca por nome ou telefone
- **Barbeiros** — Gerenciamento de equipe
- **Serviços** — Catálogo com preço e duração
- **Autenticação** — Login seguro com JWT

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Query, React Hook Form |
| Backend | Node.js, Express 5, TypeScript, Prisma 7 |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT (jsonwebtoken) |
| Validação | Zod |

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd barbearia-rei-api
npm install
cp .env.example .env
# Edite o .env com suas credenciais do banco
npx prisma migrate dev --name init
npm run db:seed
npm run dev
# API disponível em http://localhost:3333
```

### Frontend

```bash
cd barbearia-rei-web
npm install
cp .env.example .env
npm run dev
# Interface disponível em http://localhost:5173
```

### Acesso padrão

| Campo | Valor |
|-------|-------|
| E-mail | admin@barbeariadorei.com |
| Senha | admin123 |

> **Importante:** Troque a senha após o primeiro acesso em produção.

## Variáveis de Ambiente

### Backend (`barbearia-rei-api/.env`)

```env
DATABASE_URL="postgresql://user:password@host:5432/barbearia_rei"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3333
NODE_ENV=development
```

### Frontend (`barbearia-rei-web/.env`)

```env
VITE_API_URL=http://localhost:3333/api/v1
```

## Scripts Disponíveis

### Backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run db:migrate` | Roda as migrations |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio |

### Frontend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |

## Rotas da API

```
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/stats

GET    /api/v1/barbers
POST   /api/v1/barbers
PATCH  /api/v1/barbers/:id
DELETE /api/v1/barbers/:id

GET    /api/v1/services
POST   /api/v1/services
PATCH  /api/v1/services/:id
DELETE /api/v1/services/:id

GET    /api/v1/clients
POST   /api/v1/clients
PATCH  /api/v1/clients/:id
DELETE /api/v1/clients/:id

GET    /api/v1/appointments
POST   /api/v1/appointments
PATCH  /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id/status
DELETE /api/v1/appointments/:id
```

## Roadmap

- [ ] Notificações via WhatsApp (Evolution API / Z-API)
- [ ] Programa de fidelidade (cartão digital)
- [ ] Controle de estoque de produtos
- [ ] Relatórios financeiros com gráficos
- [ ] Perfil de acesso para barbeiros
- [ ] Agendamento online para clientes
