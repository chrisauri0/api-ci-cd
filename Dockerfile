# syntax=docker/dockerfile:1

# ============================================================
# Etapa 1: base con pnpm
# ============================================================
FROM node:22-alpine AS base
RUN npm install -g pnpm@10.28.0
WORKDIR /app

# ============================================================
# Etapa 2: build (instala TODO y compila TypeScript -> dist/)
# ============================================================
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build

# ============================================================
# Etapa 3: solo dependencias de producción
# ============================================================
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# ============================================================
# Etapa 4: imagen final (ligera, sin devDependencies ni código fuente)
# ============================================================
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# Hash del commit (lo manda GitHub Actions) para verlo en GET /api/info
ARG GIT_SHA=local
ENV GIT_SHA=$GIT_SHA

# No correr como root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health/ping || exit 1

CMD ["node", "dist/main.js"]
