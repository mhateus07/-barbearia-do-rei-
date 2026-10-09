# Seu Barbeiro — API

Backend do Seu Barbeiro, sistema de gestão para barbearias. Visão geral, regras de
negócio e operação estão no [README da raiz](../README.md).

## Stack

- **Runtime:** Node.js 24
- **Framework:** Express 5
- **Linguagem:** TypeScript
- **ORM:** Prisma 7 com `@prisma/adapter-pg`
- **Banco:** PostgreSQL, um banco por salão (`SALON_DATABASES`)
- **Auth:** JWT
- **Validação:** Zod 4
- **Pix:** Mercado Pago (sinal e mensalidade de assinatura)
- **Avisos:** Web Push

## Instalação

```bash
npm install
cp .env.example .env
# Configure o .env (DATABASE_URL, JWT_SECRET, SALON_TIMEZONE...)
npm run db:deploy
npm run db:seed
npm run dev
```

Testes de integração (PostgreSQL local descartável, bancos `salon_test_*`):

```bash
sh scripts/test-local.sh
```

## Estrutura

```
src/
├── config/         # JWT e validação de env
├── lib/            # Prisma por salão (contexto da requisição) e Mercado Pago
├── middlewares/    # Auth, salão, validação, limite de requisições, erros
├── modules/
│   ├── auth/           # login e usuário atual
│   ├── appointments/   # agenda, comanda e regras de horário (scheduling.ts)
│   ├── barbers/        # profissionais
│   ├── services/       # serviços
│   ├── clients/        # clientes e fidelidade
│   ├── dashboard/      # painel do dia e gráficos
│   ├── finances/       # recebimentos, despesas, comissões e vales
│   ├── cash/           # abertura, movimentos e fechamento de caixa
│   ├── subscriptions/  # planos e assinaturas
│   ├── payments/       # sinal Pix
│   ├── operations/     # usuários, bloqueios, estoque, retornos, lista de espera, fichas
│   ├── notifications/  # mensagens e lembretes
│   ├── push/           # avisos no celular
│   ├── public/         # agendamento online e link do cliente
│   └── settings/       # configurações do salão
└── utils/          # datas no fuso do salão, telefone, bcrypt, respostas
```
