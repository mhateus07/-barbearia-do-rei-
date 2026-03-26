# Barbearia do Rei — Web

Frontend do painel administrativo.

## Stack

- **Framework:** React 18 + Vite
- **Estilos:** Tailwind CSS 3
- **Estado servidor:** TanStack Query (React Query)
- **Formulários:** React Hook Form + Zod
- **HTTP:** Axios
- **Datas:** date-fns

## Instalação

```bash
npm install
cp .env.example .env
# Configure VITE_API_URL
npm run dev
```

## Estrutura

```
src/
├── api/            # Funções de chamada à API
├── components/
│   ├── layout/     # AdminLayout, Sidebar, Header
│   └── ui/         # Button, Input, Modal, Table, Badge, Card
├── contexts/       # AuthContext
├── pages/          # Dashboard, Barbeiros, Serviços, Clientes, Agendamentos
├── routes/         # AppRouter, PrivateRoute
├── types/          # Interfaces TypeScript
└── utils/          # Formatação de data, moeda, status
```
