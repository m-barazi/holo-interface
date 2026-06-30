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

## Quickstart (Docker — primärer Pfad)

Das System läuft **in Docker**, lokal wird kein Dev-Server benötigt. Der Build
erfolgt vollständig in den Multi-Stage-Dockerfiles.

```bash
cp .env.example .env          # Werte anpassen (insb. NEXT_PUBLIC_* und CORS_ORIGIN)
docker compose up -d --build   # web → :3000  ·  server → :4000
```

- Healthchecks: `GET http://localhost:4000/healthz` (`{"status":"ok"}`).
- Die Browser-Endpunkte `NEXT_PUBLIC_SOCKET_URL` / `NEXT_PUBLIC_API_URL` müssen
  auf die **öffentliche** Server-URL zeigen, damit der Client Socket.IO erreicht
  (z. B. `http://barazi.cloud:4000`).

### Deploy auf Hostinger-VPS

1. Repo nach GitHub pushen (Branch `main`).
2. Auf dem VPS (Docker installiert) das Repo als Docker-Compose-Projekt anlegen
   — der Hostinger-VPS-Dienst zieht `docker-compose.yaml` aus dem `main`-Branch
   und baut/startet beide Container.
3. `.env` auf dem VPS mit den öffentlichen URLs befüllen.

> Optional: Reverse-Proxy (Caddy/Traefik) vor `:3000`/`:4000` für TLS setzen.

## Quickstart (Lokal, nur Entwicklung)

```bash
pnpm install
cp .env.example .env
pnpm dev        # web → http://localhost:3000  ·  server → :4000
```

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