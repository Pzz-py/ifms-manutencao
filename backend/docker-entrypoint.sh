#!/bin/sh
# ---------------------------------------------------------------------
# Entrypoint do container do backend.
#
# Usamos `prisma db push` em vez de `prisma migrate deploy` porque este
# projeto não versiona uma pasta prisma/migrations (as migrações foram
# aplicadas localmente durante o desenvolvimento, fora do container).
# Para um protótipo com SQLite, `db push` é a forma correta e simples
# de sincronizar o schema.prisma com o banco — sem exigir histórico de
# migração. Se o projeto evoluir para produção "de verdade", o caminho
# recomendado passa a ser gerar migrations reais (`prisma migrate dev`
# localmente, commitar a pasta) e trocar este comando por
# `prisma migrate deploy`.
# ---------------------------------------------------------------------
set -e

# O volume nomeado do Docker monta /app/data vazio na primeira execução;
# garantimos que a pasta existe antes do Prisma tentar criar o arquivo
# dev.db dentro dela.
mkdir -p /app/data

echo "🗄  Sincronizando o schema do banco de dados (prisma db push)..."
npx prisma db push --accept-data-loss --skip-generate

echo "🚀 Iniciando a API..."
exec node src/server.js
