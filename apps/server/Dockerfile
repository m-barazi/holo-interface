# syntax=docker/dockerfile:1
# Holo-Interface — Backend (Express + Socket.IO)
# Multi-Stage: builder → runner

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Ganzes Repo (ohne node_modules/dist/.next via .dockerignore) — so stimmt
# die Workspace-Definition zum Lockfile und pnpm legt alle node_modules an.
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @holo/shared build
RUN pnpm --filter @holo/server build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Server importiert nur @holo/shared (siehe apps/server/package.json deps).
# tokens/ui/three-avatar sind Web-seitig und werden vom Server nicht benötigt —
# weglassen verkleinert das Image und beschleunigt den VPS-Pull.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --prod --frozen-lockfile --filter @holo/server... --filter @holo/shared
# Kompilierte Artefakte
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]