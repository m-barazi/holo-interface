# syntax=docker/dockerfile:1
# Holo-Interface — Backend (Express + Socket.IO)
# Multi-Stage: deps → builder → runner

FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared
RUN pnpm --filter @holo/shared build
RUN pnpm --filter @holo/server build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Nur Produktions-Abhängigkeiten installieren
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --prod --frozen-lockfile
# Kompilierte Artefakte kopieren
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]