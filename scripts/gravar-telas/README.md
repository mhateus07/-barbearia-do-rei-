# Gravar as telas do site

Gera os vídeos de `seu-barbeiro-web/public/videos`, usados na página de
apresentação, gravando o sistema de verdade numa **cópia local** (nunca
produção). Mesmo método do Pedeli (`SaaS_Pedeli/scripts/gravar-telas`).

## Pré-requisitos

1. Banco descartável no container `salon-operations-test` (porta 55439):
   `docker exec salon-operations-test psql -U postgres -c "CREATE DATABASE salon_rec"`,
   depois `DATABASE_URL=postgresql://postgres:salon_test_only@127.0.0.1:55439/salon_rec npx prisma migrate deploy`
   e os dados fictícios com `SALON_DATABASES='{"demo":"<mesma URL>"}' DEFAULT_SALON=demo PUBLIC_WEB_URL=http://localhost:5199 node scripts/demo-data.cjs criar`
   (rodar em `seu-barbeiro-api`, com `npm run build` feito).
2. API local: `node scripts/gravar-telas/rec-api.cjs` (porta 3334; cria o acesso de demonstração e chama o salão de "Barbearia Aurora").
3. Painel: em `seu-barbeiro-web`, `VITE_API_URL=http://localhost:3334/api/v1 npx vite build --outDir /tmp/rec-dist`
   e `npx vite preview --outDir /tmp/rec-dist --port 5199`.
4. Google Chrome instalado (o Playwright usa `channel: 'chrome'`) e `ffmpeg`.

## Gravar

```sh
cd scripts/gravar-telas
npm install
sh gravar.sh
```

O primeiro uso salva um retrato do banco em `.work/base.dump`; a cena da agenda
volta o banco a esse retrato antes de gravar, então as tomadas saem iguais.

## Como funciona

- `rec-common.cjs`: tira screenshots 2x em sequência com as animações da
  página desaceleradas (`SLOW = 2.5`); no MP4 o tempo volta ao normal. Cursor
  visível (seta no computador, círculo no celular).
- `cena-agenda.cjs` (1600×900): relógio do navegador em "amanhã, 10:40"; clica
  num horário livre, agenda um corte + barba, abre a comanda de outro cliente e
  confirma.
- `cena-agendamento.cjs` (390×737): o cliente agenda pelo link, do serviço ao
  "Horário confirmado".
- `finaliza.py`: transição suave no fim do loop, versão de 960px da agenda e as capas.
