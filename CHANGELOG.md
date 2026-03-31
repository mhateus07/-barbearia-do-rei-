# Changelog — Barbearia do Rei

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
- **Backend**: Node.js + Express 5 + Prisma 7 + PostgreSQL + JWT + Zod
- **Frontend**: React + Vite + Tailwind CSS 3 + React Query + Recharts + jsPDF
- **Banco (VPS)**: 31.97.160.94 — `barbearia_rei`
- **Repositório**: https://github.com/mhateus07/-barbearia-do-rei-

## Próximos passos planejados
- Deploy na VPS
- Agendamento pelo cliente (link público sem login)
- Notificações via WhatsApp
- Agenda semanal
- Programa de fidelidade
