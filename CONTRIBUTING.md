# Contributing

Danke, dass du zu **Holo-Interface** beitragen möchtest!

## Setup

```bash
pnpm install
cp .env.example .env   # Werte anpassen
```

## Entwicklung

```bash
pnpm dev          # web :3000 · server :4000 (parallele Turborepo-Tasks)
```

> Hinweis: Der primäre Deployment-Pfad ist **Docker auf dem Hostinger-VPS**
> (siehe `docker-compose.yml`). Lokaler Dev-Server nur für Entwicklung.

## Qualitäts-Gates (vor jedem Commit)

```bash
pnpm typecheck   # tsc --noEmit in allen Workspaces
pnpm test        # Vitest
pnpm build       # turbo build (shared → server → web)
pnpm format      # Prettier
```

## Conventional Commits

```
feat(scope): …
fix(scope): …
docs: …
chore: …
```

Scopes: `web`, `server`, `ui`, `tokens`, `shared`, `three-avatar`.

## Branches & PRs

- Feature-Branch von `main`: `feat/<thema>`
- PRs benötigen grüne CI (Typecheck · Test · Build · Docker-Smoke).
- Beschreibung via PR-Template ausfüllen.

## Docker

```bash
docker compose build
docker compose up -d
```

Container: `holo-web` (:3000), `holo-server` (:4000, Healthcheck `/healthz`).