# ---------------------------------------------------------------------
# Backend — API (Node.js + Express + Prisma)
# ---------------------------------------------------------------------
# Usamos node:20-slim (Debian) em vez de alpine porque os engines do
# Prisma precisam de OpenSSL e têm histórico de problemas de
# compatibilidade com a musl libc do Alpine.
FROM node:20-slim

# OpenSSL é exigido pelo Prisma Client em tempo de execução.
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia primeiro só os manifestos para aproveitar o cache de camadas do
# Docker — só reinstala dependências quando package.json muda.
COPY package*.json ./

# Não usamos --omit=dev de propósito: o pacote `prisma` (CLI) está em
# devDependencies e é necessário em tempo de execução dentro do
# container para aplicar o schema no banco (ver docker-entrypoint.sh).
RUN npm install

COPY . .

# Gera o Prisma Client já na imagem, para o primeiro start ser rápido.
RUN npx prisma generate

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["/app/docker-entrypoint.sh"]
