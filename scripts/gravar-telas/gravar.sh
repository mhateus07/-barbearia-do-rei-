#!/bin/sh
# Grava as cenas e finaliza os vídeos. Pré-requisitos no README.md.
set -eu
cd "$(dirname "$0")"
mkdir -p .work
[ -f .work/base.dump ] || docker exec salon-operations-test pg_dump -U postgres -Fc salon_rec > .work/base.dump
node cena-agendamento.cjs
node cena-agenda.cjs
python3 finaliza.py
