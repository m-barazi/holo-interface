# Holo-Interface

Futuristisches, glas-morphisches Steuerzentrum für einen holografischen KI-Assistenten. Monorepo (Next.js + Node/Socket.IO), Sci-Fi-Designsystem mit Neon-Akzenten, 3D-Avatar (React Three Fiber + GLB), Echtzeit-Telemetrie und Live-Chat.

```
┌─ Top-Bar ─────────────────────────────────────────────┐
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Main-Outlet (Widget-Grid)                 │
│ + Switch │                                            │
├──────────┴───────────────────────────────────────────┤
│ Status-Dock (Mini-Telemetrie + Avatar-Status-Pill)    │
└──────────────────────────────────────────────────────┘
```

## Quickstart (Lokal)

```bash
pnpm install
cp .env.example .env
pnpm dev        # web → http://localhost:3000  ·  server → :4000
```

## Docker

```bash
cp .env.example .env
docker compose up --build     # web → :3000  ·  server → :4000
```

- Healthchecks: `GET http://localhost:4000/healthz` (`{"status":"ok"}`), `GET http://localhost:3000/api/health`.
- Reverse-Proxy-Profil (Caddy/Traefik + TLS) ist in `docker-compose.yml` als auskommentiertes Produktions-Profil hinterlegt.

## Struktur

```
apps/
  web/        Next.js 14 (App Router, TS, Tailwind) — Frontend
  server/     Node 20 + Express + Socket.IO — Echtzeit-Backend
packages/
  tokens/     Design-Tokens (Farbe, Spacing, Motion, Glass, Typo) + Tailwind-Preset
  shared/     Typsicheres Socket/REST-Protokoll (web & server)
  ui/         Designsystem-Komponenten (Glass, Neon, Slider, Tabs, Pills, Palette…)
  three-avatar/  R3F-Avatar (GLB, Morph-Targets, Status→Mimik-Controller)
```

## Scripts

| Befehl            | Bedeutung                                  |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Web + Server parallel (Turborepo)          |
| `pnpm build`      | Build aller Packages/Apps                  |
| `pnpm typecheck`  | TypeScript-Check (strict)                  |
| `pnpm test`       | Unit- & Component-Tests (Vitest)           |
| `pnpm test:e2e`   | Playwright-E2E                             |
| `pnpm lint`       | ESLint                                     |

## Tech-Stack

Next.js 14 · React 18 · TypeScript (strict) · Tailwind CSS · Framer Motion · Zustand · React Three Fiber + drei · Socket.IO · Express · recharts · lucide-react · next-intl · Vitest · Playwright · Turborepo · Docker.

## Design-Dokumentation

- Spec: `docs/superpowers/specs/2026-06-30-holo-interface-design.md`
- Plan: `docs/superpowers/plans/2026-06-30-fundament-schiene.md`

## Lizenz

MIT — siehe `LICENSE`.