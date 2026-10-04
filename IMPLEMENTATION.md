# Evolução do produto para salões

Escopo aprovado: confiabilidade, isolamento entre salões, permissões, identidade,
agenda visual e escalas, financeiro, retorno, reativação, lista de espera e fichas técnicas.

## Decisões

- Isolamento inicial por banco de dados de salão. Um único código atende instalações
  selecionadas por slug; credenciais e dados nunca são compartilhados entre bancos.
- Nenhum envio real de campanha ocorre sem ação explícita do operador.
- Migrações preservam os registros existentes; execução em produção é separada do desenvolvimento.
- A evolução será verificada com compilação e testes das regras críticas.

## Entregas

- [x] Agenda consistente, concorrência e fidelidade idempotente
- [x] Lembretes com execução periódica e retentativas
- [x] Seleção segura de salão, identidade e permissões
- [x] Agenda visual, escalas, bloqueios e serviços por profissional
- [x] Recebimentos parciais, estornos, comissões históricas e comanda
- [x] Próximo retorno, reativação, lista de espera e indicadores
- [x] Fichas técnicas e serviços por etapas / recursos
- [x] Testes e documentação de operação

## Validação concluída em 26/09/2026

- API e interface compiladas; lint da interface sem erros.
- Suíte de integração: 21 testes aprovados em PostgreSQL local descartável.
- Cobertura de concorrência, isolamento entre salões, permissões, fidelidade,
  recebimentos, estornos, comissões, recursos, estoque, retornos e fila de mensagens.
- Fluxo público de lista de espera conferido no navegador com dados fictícios;
  solicitação visível no painel de oportunidades.
- Agenda e criação de atendimento verificadas no navegador; painel de oportunidades
  conferido em largura de celular (390 px).

## Ativação operacional

- [x] Produção no ar em 03/10/2026: https://seubarbeiro.impulsiodigital.com (VPS Contabo,
  Docker + Traefik), migrações aplicadas, HTTPS ativo e acesso do dono criado.
- [ ] Trocar a senha inicial do dono (Agenda e operação → Equipe e serviços → Acessos da
  equipe → Trocar senha) e apagar `/root/seu-barbeiro-acesso-inicial.txt` na VPS.
- [ ] Cadastrar serviços, profissionais e horários; o banco de produção começou vazio.
- [ ] Configurar e validar o provedor real de WhatsApp.
- [ ] Realizar piloto e conferir as regras comerciais com a equipe.

A demonstração usa dados fictícios e mantém o envio automático desativado.
Pagamentos são registros internos; não há cobrança Pix/cartão integrada.
Fotos nas fichas são links com consentimento; não há armazenamento de uploads.
