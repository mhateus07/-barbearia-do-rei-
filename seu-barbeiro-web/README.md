# Seu Barbeiro — Web

Painel da barbearia, agendamento online e página de apresentação. Em produção é servido
pela própria API (ver [README da raiz](../README.md)).

## Stack

- **Framework:** React 19 + Vite 8
- **Estilos:** Tailwind CSS 4
- **Rotas:** React Router 7
- **Estado servidor:** TanStack Query 5
- **Formulários:** React Hook Form + Zod
- **HTTP:** Axios
- **Datas:** date-fns
- **Gráficos:** Recharts

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
│   ├── layout/     # Layout do painel e menu
│   ├── public/     # Peças das páginas públicas
│   └── ui/         # Button, Input, Modal, Spinner...
├── contexts/       # AuthContext
├── hooks/
├── pages/
│   ├── site/       # Página de apresentação (raiz /)
│   ├── booking/    # Agendamento online (/agendar) e lista de espera pública
│   ├── public/     # Pagamento do sinal Pix e link do cliente
│   ├── operations/ # Operação do dia e oferta de vaga (/oferta)
│   └── ...         # Painel, Profissionais, Serviços, Clientes,
│                   # Agendamentos, Financeiro, Assinaturas, Caixa, Vitrine, Configurações
├── routes/         # AppRouter, PrivateRoute
├── types/          # Interfaces TypeScript
└── utils/          # Datas, moeda, status
```
