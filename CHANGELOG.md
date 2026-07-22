# Changelog — Barbearia do Rei

## [22/07/2026] — Conversão para SaaS multi-tenant + deploy em produção

Sessão longa: o painel single-tenant da Barbearia do Rei virou uma SaaS
multi-tenant completa, vendável para outras barbearias, terminando com
deploy real em produção. Branch `saas-multi-tenant` no mesmo repositório
(o código do cliente real permanece intocado no VPS antigo).

### Multi-tenancy (schema + isolamento)
- Novo modelo `Tenant` + `tenantId` em todos os 11 modelos de negócio, via
  3 migrações 100% aditivas (nullable → backfill → NOT NULL + constraints
  compostas), testadas contra cópia real do banco antes de aplicar
- Isolamento por tenant implementado com `AsyncLocalStorage` +
  Prisma Client Extension (`src/lib/prisma.ts`) — injeta `tenantId`
  automaticamente em toda operação sobre os modelos de negócio, sem
  precisar editar os ~83 pontos de acesso ao banco espalhados pelos
  services
- **Isolamento testado com dois tenants reais rodando lado a lado**:
  painel admin, rotas públicas e até o caso de um JWT de um tenant com
  header de outro (o JWT sempre vence) — zero vazamento de dado

### Branding dinâmico por tenant
- Todo hardcode de "Barbearia do Rei" removido de Sidebar, LoginPage,
  ShowcasePage, BookingPage e do cabeçalho do PDF financeiro
- `GET /public/:slug/info` devolve nome, logo, endereço, telefone,
  Instagram, horários e portfólio de cada tenant
- Upload de logo e galeria de portfólio direto pelo painel
  (`/configuracoes`), salvos em disco no VPS (uma pasta por tenant)

### Onboarding self-serve
- Cadastro público (`/signup`): cria barbearia + admin + serviço inicial
  numa operação só, já loga automaticamente — sem nenhum passo manual
  de banco

### Jobs em background
- BullMQ + Redis conectam a função de lembrete de WhatsApp (que já
  existia mas não era chamada por nada) a um agendamento real: varre
  tenants ativos periodicamente e envia lembretes isolados por tenant

### Estrutura de URL: path/slug em vez de subdomínio
- Decisão inicial era subdomínio por tenant, revertida ao descobrir que
  o VPS de produção usa Traefik com certificado por domínio exato (não
  wildcard) — subdomínio novo exigiria DNS + deploy manual a cada
  cadastro, o que quebraria o self-serve
- Modelo final: um domínio único (`saas.impulsiodigital.com`), tenant
  identificado por slug na URL (`/sua-barbearia/agendar`); login passa a
  pedir slug + e-mail + senha

### Docker + deploy em produção
- Dockerfile único (build do front + build da API + runtime), a própria
  API passa a servir os arquivos estáticos do front (mesmo container,
  mesmo domínio) — não há nginx próprio, o Traefik que já roda no VPS
  cuida do roteamento e HTTPS
- `docker-compose.yml` (base, testável localmente) +
  `docker-compose.prod.yml` (overlay com os labels do Traefik) +
  `docker-compose.local.yml` (porta publicada, só dev)
- **Deploy real concluído**: https://saas.impulsiodigital.com no ar,
  HTTPS válido via Let's Encrypt (Traefik existente), rodando em
  `/opt/barbearia-saas` no VPS `173.212.208.109`
- VPS teve a chave SSH configurada e login por senha desabilitado
  (hardening de segurança)

### Bugs reais encontrados e corrigidos durante os testes/deploy
- Contexto de tenant se perdia depois do parsing assíncrono do `multer`
  no upload de imagens — corrigido reestabelecendo o contexto a partir
  de `req.tenantId`
- `prisma.config.ts` (raiz do projeto) não estava sendo copiado pra
  imagem Docker de runtime, quebrando `prisma migrate deploy` dentro do
  container
- Container ficou em duas redes Docker diferentes (a do compose e a
  overlay do Traefik); o Traefik tentava rotear pelo IP da rede errada
  (isolada) e todo request dava timeout — corrigido com o label
  `traefik.docker.network=easypanel`
- `ports: []` num arquivo de override do Compose não limpava a
  publicação de porta do arquivo base — a porta 3333 ficou acessível
  direto da internet por alguns minutos, ignorando Traefik/HTTPS;
  corrigido removendo a publicação de porta do arquivo base

### Fundação (testes/CI)
- Vitest + Supertest, primeiros testes automatizados do projeto
  (`auth.service`, `public.service`)
- CI no GitHub Actions (lint + typecheck + testes) em todo PR

### Adiado / não incluído nesta sessão
- Cobrança recorrente via Mercado Pago e Pix de sinal (credenciais de
  produção já em mãos, guardadas, aguardando implementação)
- Automação do deploy via CI/CD (hoje é `git pull` + `docker compose up`
  manual por SSH)
- Concierge de WhatsApp com IA (Claude API) — pulado a pedido do
  usuário, sem urgência

---

## [31/03/2026] — Sessão de desenvolvimento

### Agendamento Online pelo Cliente (link público)
- Nova página pública `/agendar` sem necessidade de login
- Wizard em 5 passos: Serviços → Barbeiro → Data & Hora → Seus Dados → Confirmar
- Tela de sucesso com resumo do agendamento após confirmação
- Design próprio (tema escuro premium, botões âmbar) — independente do painel admin
- Cliente pode selecionar múltiplos serviços com cálculo automático de duração e valor total
- Opção "Sem preferência" de barbeiro: sistema escolhe automaticamente o primeiro disponível
- Slots de horário gerados com base nos horários de funcionamento cadastrados nas configurações
- Slots já ocupados são filtrados automaticamente (sem sobreposição de agendamentos)
- Horários passados (antes do momento atual) não são exibidos
- Clientes novos são criados automaticamente pelo telefone; clientes existentes são identificados sem duplicar cadastro

### API Pública (sem autenticação)
- `GET /api/v1/public/info` — informações da barbearia e horários de funcionamento
- `GET /api/v1/public/services` — serviços ativos com preço e duração
- `GET /api/v1/public/barbers` — barbeiros ativos
- `GET /api/v1/public/barbers/:id/slots?date=&duration=` — horários disponíveis no dia para um barbeiro
- `POST /api/v1/public/appointments` — cria cliente (se novo) + agendamento

### Botão de compartilhamento no Sidebar
- Card "Agendamento Online" no rodapé do menu lateral do painel admin
- Botão "Copiar link" copia a URL de agendamento para o clipboard (com feedback "Copiado!")
- Botão de ícone abre a página `/agendar` em nova aba

### Correções
- Import de interfaces TypeScript alterado para `import type` na BookingPage (compatibilidade com `verbatimModuleSyntax`)
- Cast explícito com `String()` nos parâmetros de query do controller público (compatibilidade com Express 5 types)

---

## [26/03/2026] — Sessão de desenvolvimento

### Módulo Financeiro
- Lançamento de pagamentos por forma (Dinheiro, Pix, Cartão de Crédito, Cartão de Débito)
- Contas a Pagar com categorias (Aluguel, Utilities, Materiais, Salários, Equipamentos, Marketing, Outros), vencimento e status (Pendente / Pago / Vencido)
- Fluxo de Caixa com gráfico de área (receita × despesas por dia)
- Cards de resumo: Receita, Despesas Pagas, Saldo, Contas Pendentes
- Pizza de receita por forma de pagamento
- Barras de despesas por categoria
- Filtro de período (data inicial / data final)
- Rota: `/financeiro`

### Comissões dos Barbeiros
- Campo `commissionRate (%)` no cadastro e edição de cada barbeiro
- Taxa exibida no card do barbeiro
- Tab **Comissões** no Financeiro com tabela: atendimentos, receita gerada, taxa e valor da comissão por barbeiro
- Totalizador no rodapé da tabela

### Relatório PDF
- Botão "Exportar PDF" no cabeçalho do Financeiro
- PDF gerado com: cards de resumo, tabela de fluxo de caixa por dia e tabela de comissões
- Arquivo salvo como `financeiro-AAAA-MM-DD-AAAA-MM-DD.pdf`

### Edição de Agendamentos
- Botão de lápis nos agendamentos com status `SCHEDULED` ou `CONFIRMED`
- Abre o modal preenchido com os dados existentes (cliente, barbeiro, serviços, data/hora)
- Salva via PATCH no backend

### Histórico do Cliente
- Ícone de histórico na linha de cada cliente
- Modal com: total de agendamentos, concluídos, total gasto e lista completa de atendimentos com status e valor

### Vitrine
- Página `/vitrine` com logo, avaliação 5 estrelas e slogan
- Card com endereço completo, telefone, Instagram e horários de funcionamento
- Mapa do Google embutido (Rua Jose Narcisio Silva 1003, Fábricas, São João del Rei — MG)
- Galeria com 20 fotos do portfólio em grid
- Lightbox com navegação por setas e contador ao clicar nas fotos

### Logo
- Logo real da barbearia (`logo.jpeg`) no topo do sidebar substituindo o ícone genérico

### Correções
- Bug de timezone no filtro de agendamentos e dashboard: datas `YYYY-MM-DD` eram interpretadas como UTC midnight, deslocando o intervalo de busca um dia para trás no horário do Brasil (UTC-3). Corrigido com `T00:00:00` para forçar interpretação em horário local.
- Imports de tipo (`import type`) nos componentes UI para compatibilidade com `verbatimModuleSyntax`
- Ícone `Instagram` substituído por `AtSign` (não existe no lucide-react)
- Variável `deleteMutation` não utilizada removida da AppointmentsPage

---

## Stack

### Sistema original (cliente real, single-tenant)
- **Backend**: Node.js + Express 5 + Prisma 7 + PostgreSQL + JWT + Zod
- **Frontend**: React + Vite + Tailwind CSS 3 + React Query + Recharts + jsPDF
- **VPS**: 31.97.160.94 — domínio `rei.impulsiodigital.com` — banco `barbearia_rei`
- **Repositório**: https://github.com/mhateus07/-barbearia-do-rei- (branch `main`)

### SaaS multi-tenant (branch `saas-multi-tenant`)
- **Backend**: Node.js + Express 5 + Prisma 7 (Client Extension pra
  multi-tenancy) + PostgreSQL + JWT + Zod + BullMQ + Redis + Multer
- **Frontend**: React + Vite + Tailwind CSS 3 + React Query + Recharts + jsPDF
- **Infra**: Docker + docker-compose, deploy atrás do Traefik já
  existente no VPS (Easypanel)
- **VPS**: 173.212.208.109 — domínio `saas.impulsiodigital.com` — pasta
  `/opt/barbearia-saas`
- **Repositório**: https://github.com/mhateus07/-barbearia-do-rei-
  (branch `saas-multi-tenant`)

## Próximos passos planejados (SaaS)
- Cobrança recorrente das barbearias-clientes via Mercado Pago
- Pix de sinal no agendamento público (reduzir no-show)
- Automatizar o deploy via CI/CD (hoje é manual via SSH)
- Concierge de WhatsApp com IA (Claude API) — pausado por enquanto
