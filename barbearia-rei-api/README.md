# Barbearia do Rei — API

Backend da aplicação de gestão para barbearia.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Linguagem:** TypeScript
- **ORM:** Prisma 7
- **Banco:** PostgreSQL
- **Auth:** JWT
- **Validação:** Zod
- **Adapter DB:** @prisma/adapter-pg

## Instalação

```bash
npm install
cp .env.example .env
# Configure o .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Estrutura

```
src/
├── config/         # JWT e validação de env
├── lib/            # Singleton do PrismaClient
├── middlewares/    # Auth, validação, erros
├── modules/
│   ├── auth/
│   ├── barbers/
│   ├── services/
│   ├── clients/
│   ├── appointments/
│   └── dashboard/
└── utils/          # bcrypt, response helpers
```
