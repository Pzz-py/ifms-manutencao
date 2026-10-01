# ---------------------------------------------------------------------
# Frontend — build multi-stage
# ---------------------------------------------------------------------

# ---- Estágio 1: build da SPA com Vite ----
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Estágio 2: serve os estáticos via Nginx ----
FROM nginx:1.27-alpine

# Configuração customizada: serve a SPA (com fallback para index.html
# nas rotas do react-router) e faz proxy de /api e /uploads para o
# container do backend. Isso replica, em produção, o mesmo
# comportamento do proxy do Vite em desenvolvimento (ver
# frontend/vite.config.js) — o axios continua chamando "/api" como
# caminho relativo, sem precisar saber o endereço real do backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
