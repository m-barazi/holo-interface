# Holo-Interface VPS-Light Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repo A-Z aufräumen und schlank machen für Hostinger-VPS (1 CPU/4 GB) — Build-Pipeline korrigieren, Bundle/Deps schlank, Docker/Compose konsolidieren, Server-Robustheit — ohne Verhaltenswechsel, nur Code- und GitHub-Seite.

**Architecture:** 4 thematische Phasen als jeweils eigener Commit, pro Phase CI-grün verifizierbar. Build-Pipeline erhält eine Web-spezifische ESLint-Config und korrigierte Turbo-Topologie. Bundle-Deps werden via `optimizePackageImports` + `LazyMotion`-Feature-Split verkleinert und `recharts` als toter Ballast entfernt. Docker/Compose werden auf zwei Files (Source-Build + prod/GHCR+proxy) konsolidiert und das Server-Image verschlankt. Der Server bekommt SIGTERM-Graceful-Shutdown.

**Tech Stack:** pnpm 8.15 Workspaces + Turborepo v1.13, Next.js 14.2 (standalone), TypeScript strict, Vitest, ESLint 8 + eslint-config-next, Framer Motion 11, React Three Fiber + drei v9, Docker multi-stage (node:20-alpine), GHCR, Traefik.

## Global Constraints

- **Scope:** Nur Code + GitHub-Seite. Kein VPS-Deploy, kein lokales Starten der App (`next dev`/Server-runtime). Das hier verwendete `pnpm install`/`pnpm -r build`/`pnpm -r lint`/`pnpm -r typecheck`/`pnpm -r test` sind **Repo-Wartung und Pre-Commit-Verifikation**, nicht App-Runtime — sie sind nötig, um einen committbaren, CI-grünen Stand für GitHub zu produzieren. Dev-Server wird nie gestartet.
- **pnpm-Version:** pnpm@8.15.0 (corepack-pinned in Dockerfiles). Lockfile-Änderungen nur via `pnpm install` (kein manuelles Editieren von `pnpm-lock.yaml`).
- **Kein Verhaltenswechsel:** UI/Animationen/Render-Ergebnisse bleiben identisch. Bundle-Optimierungen sind reine Tree-Shaking/Code-Split-Maßnahmen.
- **Keine `// eslint-disable`-Flucht:** Lint-Verstöße werden an der Quelle gefixt.
- **Sprache:** Commits/Comments auf Deutsch, Code-Identifier original.
- **Commit-Messages:** enden mit `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **`@holo/shared`-Auflösung:** `types: ./src/index.ts` → Typecheck der Consumer läuft gegen Source, benötigt keinen Build von `shared`.
- **Framer-Motion-Feature-Bundle:** `domMax` (nicht `domAnimation`), weil `Sidebar.tsx` ein `layoutId`-Shared-Layout nutzt, das nur in `domMax` enthalten ist.

---

## File Structure

- `apps/web/.eslintrc.cjs` (neu) — Web-spezifische ESLint-Config (`next/core-web-vitals`, `root:true`), shadowed die Root-Config.
- `apps/web/next.config.mjs` (modify) — `eslint.ignoreDuringBuilds` entfernen; `experimental.optimizePackageImports` ergänzen.
- `turbo.json` (modify) — `typecheck`/`test` von `^build` auf `^typecheck` + `inputs` umstellen.
- `apps/web/package.json` (modify) — `recharts` entfernen.
- `packages/three-avatar/src/AvatarScene.tsx` — unverändert (drei-Subpath bewusst nicht eingesetzt; siehe Task 4 Begründung).
- `apps/web/app/providers/MotionProvider.tsx` (neu) — `<LazyMotion strict features={domMax}>`-Provider.
- `apps/web/app/[locale]/layout.tsx` (modify) — MotionProvider einhängen.
- `packages/ui/src/{GlassCard,StatusPill,CommandPalette,Toaster,NeonButton,FloatingPanel}.tsx` (modify) — `motion` → `m`.
- `apps/web/components/assistant/VoiceWaves.tsx`, `apps/web/components/shell/Sidebar.tsx` (modify) — `motion` → `m`.
- `apps/server/Dockerfile` (modify) — Runner-Stage verschlankt (nur server + shared).
- `docker-compose.prod.yml` (modify) — `proxy`-Netzwerk + Web-Router + CORS-Origin.
- `docker-compose.yml` (modify) — Kopfkommentar Zweck.
- `docker-compose.vps.yml` (delete).
- `apps/server/src/shutdown.ts` (neu) — `registerShutdown(server, opts)`.
- `apps/server/src/index.ts` (modify) — `close()` schließt auch `io`; Bootstrap registriert `registerShutdown`.
- `apps/server/src/__tests__/shutdown.test.ts` (neu) — Unit-Tests für SIGTERM-Handling + Timeout-Fallback.

---

## Phase 1 — Build-Pipeline korrigieren

### Task 1: Web-ESLint-Config erstellen + ignoreDuringBuilds entfernen

**Files:**
- Create: `apps/web/.eslintrc.cjs`
- Modify: `apps/web/next.config.mjs`

**Interfaces:**
- Produces: `apps/web/.eslintrc.cjs` (ESLint-Root für Web-Subtree). `next build` und `next lint` nutzen ab hier `next/core-web-vitals` mit TS/JSX-Parser.

- [ ] **Step 1: Web-ESLint-Config anlegen**

Datei `apps/web/.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
};
```

`root: true` stoppt das Walk-up zur Root-`.eslintrc.cjs` (die keinen TS/JSX-Parser hat und `next build` auf .tsx brechen ließ). `next/core-web-vitals` bringt via `eslint-config-next` den `@typescript-eslint/parser` sowie TS-Regeln mit — keine zusätzlichen devDependencies nötig (`eslint` + `eslint-config-next` sind bereits in `apps/web/package.json`).

- [ ] **Step 2: `ignoreDuringBuilds` aus next.config.mjs entfernen**

`apps/web/next.config.mjs` — ersetze:

```js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // ESLint während des Builds deaktiviert: die Root-.eslintrc.cjs (für node-seitige
  // Workspace-Packages gedacht) extendiert nur eslint:recommended ohne TS-/JSX-Parser
  // und würde next build auf allen .tsx-Dateien abbrechen. Linting läuft separat via pnpm lint.
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
};
```

durch:

```js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Linting läuft während next build (Web-ESLint-Config: apps/web/.eslintrc.cjs).
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
};
```

- [ ] **Step 3: Lint ausführen und Fehler-Level-Verstöße fixen**

Run: `pnpm --filter @holo/web lint`
Expected: Liste der Verstöße. `next/core-web-vitals` meldet die meisten Probleme als `warn` (brechen den Build nicht) und einige als `error` (brechen `next build`).

Fixe **jeden `error`-Level-Verstoß** an der Quelle (kein `// eslint-disable`). Typische Quellen: ungenutzte Imports, `react/jsx-key`, `@typescript-eslint/no-unused-vars`. `warn`-Level-Verstöße dürfen bleiben (brechen Build/CI nicht), können aber gleich mitgefixt werden, wenn es trivial ist.

Falls `pnpm --filter @holo/web lint` mit „ESLint isn't installed" o.ä. fehlschlägt: `pnpm install` ausführen (siehe Global Constraints), dann erneut linten.

- [ ] **Step 4: Web-Build verifizieren (lintet mit)**

Run: `pnpm --filter @holo/web build`
Expected: Build grün, Lint-Schritt innerhalb des Builds ohne `error`-Abbruch.

- [ ] **Step 5: Commit**

```bash
git add apps/web/.eslintrc.cjs apps/web/next.config.mjs apps/web/package.json apps/web/pnpm-lock.yaml
# (apps/web/package.json + lockfile nur mit-adden, falls Task 3 schon lief; hier i.d.R. nicht)
git commit -m "fix(build): Web-ESLint-Config + ignoreDuringBuilds entfernt"
```

Falls Lint-Fixes weitere Web-Dateien verändert haben, diese mit `git add` erfassen.

### Task 2: turbo.json-Topologie korrigieren

**Files:**
- Modify: `turbo.json`

**Interfaces:**
- Produces: `typecheck`/`test` hängen an `^typecheck` (nicht mehr `^build`), mit `inputs` für Cache-Invalidierung.

- [ ] **Step 1: turbo.json umstellen**

Datei `turbo.json` — ersetze gesamten Inhalt:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "inputs": ["src/**", "tsconfig.json", "tsconfig.build.json", "package.json"]
    },
    "test": {
      "dependsOn": ["^typecheck"],
      "inputs": ["src/**", "tests/**", "__tests__/**", "vitest.config.*", "package.json"]
    },
    "test:e2e": { "dependsOn": ["^build"] }
  }
}
```

Begründung: `@holo/shared` exportiert `types: ./src/index.ts`, d.h. Typecheck der Consumer läuft gegen Source und braucht keinen vorgelagerten Build. `^typecheck` erhält die topologische Cache-Invalidierung (Änderung in `shared` invalidiert `web`/`server`-Typecheck), ohne einen teuren Build zu erzwingen. `test:e2e` bleibt am `^build`, da E2E gebaute Artefakte voraussetzt.

- [ ] **Step 2: Typecheck + Test verifizieren**

Run: `pnpm -r typecheck && pnpm -r test`
Expected: beides grün (ohne dass ein Build vorausging).

- [ ] **Step 3: Commit**

```bash
git add turbo.json
git commit -m "fix(turbo): typecheck/test ohne ^build (Source-Auflösung via types-Feld)"
```

---

## Phase 2 — Bundle/Deps schlank

### Task 3: recharts entfernen

**Files:**
- Modify: `apps/web/package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Produces: `apps/web/package.json` ohne `recharts`; Lockfile synchron.

- [ ] **Step 1: recharts aus package.json entfernen**

In `apps/web/package.json` die Zeile `"recharts": "^2.12.7",` aus `dependencies` löschen.

(Vorab verifiziert: kein Import von `recharts` in `apps/web/app`, `apps/web/components`, `apps/web/src` — toter Ballast.)

- [ ] **Step 2: Lockfile regenerieren**

Run: `pnpm install`
Expected: `pnpm-lock.yaml` wird aktualisiert (recharts + dessen deps fallen aus dem Web-Subgraph). Kein `--frozen-lockfile` hier — wir aktualisieren bewusst.

- [ ] **Step 3: Web-Build verifiziert recharts-frei**

Run: `pnpm --filter @holo/web build`
Expected: Build grün; kein „Module not found" für recharts.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(web): toten recharts-Dependency entfernt"
```

### Task 4: optimizePackageImports aktivieren

**Files:**
- Modify: `apps/web/next.config.mjs`

**Interfaces:**
- Produces: `experimental.optimizePackageImports` für lucide-react, framer-motion, @radix-ui, @react-three/drei.

**Begründung (drei-Subpath bewusst nicht eingesetzt):** Die Spec nannte als Primärtechnik einen drei-Subpath-Import (`@react-three/drei/core/OrbitControls`) mit Fallback auf `optimizePackageImports`. Der Subpath ist in drei v9 nicht verlässlich im `exports`-Map deklariert und würde unter `moduleResolution: Bundler` riskanterweise typ- oder auflösungsfehlerhaft werden. `optimizePackageImports` (von Next.js offiziell für `@react-three/drei` unterstützt) liefert den gleichen Tree-Shaking-Gewinn ohne dieses Risiko und ohne Import-Änderung — entspricht damit der Spec-eigenen Fallback-Klausel.

- [ ] **Step 1: optimizePackageImports ergänzen**

`apps/web/next.config.mjs` — ersetze:

```js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Linting läuft während next build (Web-ESLint-Config: apps/web/.eslintrc.cjs).
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
};
```

durch:

```js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Linting läuft während next build (Web-ESLint-Config: apps/web/.eslintrc.cjs).
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
  experimental: {
    // Granulares Tree-Shaking für Icon-/Komponenten-Libs → kleinerer dynamischer Chunk.
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-slider',
      '@radix-ui/react-tabs',
      '@react-three/drei',
    ],
  },
};
```

- [ ] **Step 2: Web-Build verifizieren**

Run: `pnpm --filter @holo/web build`
Expected: grün; drei/Avatar unverändert (keine Import-Änderung an `AvatarScene.tsx`).

- [ ] **Step 3: Commit**

```bash
git add apps/web/next.config.mjs
git commit -m "perf(web): optimizePackageImports für lucide/framer/radix/drei"
```

### Task 5: LazyMotion-Provider + motion→m konvertieren

**Files:**
- Create: `apps/web/app/providers/MotionProvider.tsx`
- Modify: `apps/web/app/[locale]/layout.tsx`
- Modify: `packages/ui/src/GlassCard.tsx`, `StatusPill.tsx`, `CommandPalette.tsx`, `Toaster.tsx`, `NeonButton.tsx`, `FloatingPanel.tsx`
- Modify: `apps/web/components/assistant/VoiceWaves.tsx`, `apps/web/components/shell/Sidebar.tsx`

**Interfaces:**
- Produces: `<MotionProvider>` (Client-Component) exportiert aus `@/providers/MotionProvider`, kapselt `<LazyMotion strict features={domMax}>`.
- Consumes: alle `m.*`-Verwender erwarten einen `LazyMotion`-Vorfahren (gegeben durch Provider im `[locale]`-Layout, das alle Pages einrahmt).

- [ ] **Step 1: MotionProvider anlegen**

Datei `apps/web/app/providers/MotionProvider.tsx`:

```tsx
'use client';

import { LazyMotion, domMax } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Lagert den Framer-Motion-Feature-Bundle in einen separaten,
 * lazy geladenen Chunk aus. `strict` erzwingt die Nutzung von `m.*`
 * (statt `motion.*`) im gesamten Subtree — ein vergessenes `motion.*`
 * wirft zur Laufzeit und macht so die Migration sichtbar.
 *
 * `domMax` statt `domAnimation`, weil die Sidebar ein `layoutId`
 * (Shared-Layout-Animation) nutzt, das nur im vollen Feature-Bundle
 * enthalten ist.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion strict features={domMax}>{children}</LazyMotion>;
}
```

- [ ] **Step 2: MotionProvider ins [locale]-Layout einhängen**

`apps/web/app/[locale]/layout.tsx` — ersetze:

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import '../globals.css';
```

durch:

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { MotionProvider } from '@/providers/MotionProvider';
import '../globals.css';
```

und ersetze:

```tsx
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <SocketProvider>{children}</SocketProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
```

durch:

```tsx
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MotionProvider>
        <ThemeProvider>
          <SocketProvider>{children}</SocketProvider>
        </ThemeProvider>
      </MotionProvider>
    </NextIntlClientProvider>
```

- [ ] **Step 3: motion → m in packages/ui (6 Dateien)**

Pro Datei genau zwei Edits:

(a) Import-Zeile ersetzen:
- `packages/ui/src/GlassCard.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`
- `packages/ui/src/StatusPill.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`
- `packages/ui/src/NeonButton.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`
- `packages/ui/src/FloatingPanel.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`
- `packages/ui/src/CommandPalette.tsx`: `import { motion, AnimatePresence } from 'framer-motion';` → `import { m, AnimatePresence } from 'framer-motion';`
- `packages/ui/src/Toaster.tsx`: `import { motion, AnimatePresence } from 'framer-motion';` → `import { m, AnimatePresence } from 'framer-motion';`

(b) In jeder dieser Dateien alle Vorkommen von `motion.` durch `m.` ersetzen (`replace_all`). Das betrifft `motion.div`, `motion.span`, `motion.button` etc. `AnimatePresence` bleibt unverändert (funktioniert mit `LazyMotion`).

- [ ] **Step 4: motion → m in apps/web (2 Dateien)**

- `apps/web/components/assistant/VoiceWaves.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`, dann `motion.` → `m.` (`replace_all`).
- `apps/web/components/shell/Sidebar.tsx`: `import { motion } from 'framer-motion';` → `import { m } from 'framer-motion';`, dann `motion.` → `m.` (`replace_all`). Das `layoutId="nav-active"` bleibt unverändert.

- [ ] **Step 5: Verifizieren, dass kein `motion.` mehr referenziert wird**

Run: `grep -rn "from 'framer-motion'" packages/three-avatar/src packages/ui/src apps/web/components apps/web/app && grep -rn "motion\." packages/ui/src apps/web/components | grep -v "framer-motion"`
Expected: erste Zeile zeigt nur noch `m`-Imports (und keine `motion`-Imports in drei — drei nutzt framer-motion aktuell gar nicht); zweite Zeile leer (kein `motion.` mehr in ui/web). Falls Reste: entsprechend konvertieren.

- [ ] **Step 6: Typecheck + Build verifizieren**

Run: `pnpm --filter @holo/ui typecheck && pnpm --filter @holo/web typecheck && pnpm --filter @holo/web build`
Expected: beides grün. `strict` würde vergessene `motion.*` erst zur Laufzeit werfen — daher ist der grep aus Step 5 der entscheidende Guard.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/providers/MotionProvider.tsx apps/web/app/[locale]/layout.tsx packages/ui/src apps/web/components/assistant/VoiceWaves.tsx apps/web/components/shell/Sidebar.tsx
git commit -m "perf(motion): LazyMotion-Feature-Split (domMax) + motion→m"
```

---

## Phase 3 — Docker/Compose konsolidieren

### Task 6: Server-Dockerfile-Runner verschlanken

**Files:**
- Modify: `apps/server/Dockerfile`

**Interfaces:**
- Produces: Runner-Stage installiert nur `apps/server` + `packages/shared` (nicht tokens/ui/three-avatar, die der Server nicht importiert).

- [ ] **Step 1: Runner-Stage auf server + shared reduzieren**

`apps/server/Dockerfile` — ersetze die Runner-Stage (ab `FROM node:20-alpine AS runner`):

```dockerfile
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
```

Hinweis: `--filter @holo/server...` (mit `...`) inkludiert dessen Workspace-Dependencies (shared). Falls pnpm die `--filter ... --filter ...`-Kombination ablehnt, stattdessen:
`RUN pnpm install --prod --frozen-lockfile --filter @holo/server...`
(ein Filter mit `...` deckt server + transitive Workspace-Dep shared ab). Zweite Variante bevorzugt verwenden, falls die erste fehlschlägt.

- [ ] **Step 2: Build verifizieren**

Run: `docker build -f apps/server/Dockerfile -t holo-server:slim .`
Expected: Build grün. Falls lokal kein Docker verfügbar: dieser Schritt wird in CI (`.github/workflows/ci.yml` docker-Job) verifiziert — dann commit und CI laufen lassen.

- [ ] **Step 3: Healthcheck-Logik prüfen (read-only)**

Bestätigen, dass `apps/server/src/index.ts` weiterhin `/healthz` exponiert (unverändert durch Phase 4 noch nicht) und `CMD ["node", "apps/server/dist/index.js"]` startet. Kein Code-Edit hier.

- [ ] **Step 4: Commit**

```bash
git add apps/server/Dockerfile
git commit -m "perf(docker): Server-Runner auf server+shared verschlankt"
```

### Task 7: docker-compose.prod.yml zum VPS-Source-of-Truth machen

**Files:**
- Modify: `docker-compose.prod.yml`

**Interfaces:**
- Produces: prod-Compose mit `proxy`-Netzwerk (external) + Traefik-Routern für `holo.barazi.cloud` (web) und `holo-api.barazi.cloud` (server) + CORS_ORIGIN env.

- [ ] **Step 1: prod.yml vollständig ersetzen**

Datei `docker-compose.prod.yml` — gesamten Inhalt ersetzen:

```yaml
# Holo-Interface — Production (GHCR-Images + Traefik) — Single Source of Truth für VPS
# Images sind vorgebaut (GitHub Actions → GHCR), der VPS pulled sie nur.
# Traefik (bestehend, externes `proxy`-Netzwerk) routet via Subdomains + TLS.
#
# Voraussetzungen auf dem VPS:
#   - Docker an GHCR angemeldet (ghcr.io/m-barazi/…)
#   - externes Netzwerk `proxy` existiert (Traefik-Setup)
#   - DNS: holo.barazi.cloud + holo-api.barazi.cloud → 76.13.2.12
#
#   docker compose -f docker-compose.prod.yml up -d
#   docker compose -f docker-compose.prod.yml logs -f --tail=50

services:
  server:
    image: ghcr.io/m-barazi/holo-interface-server:latest
    container_name: holo-server
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 4000
      CORS_ORIGIN: ${CORS_ORIGIN:-https://holo.barazi.cloud}
      LLM_ADAPTER: ${LLM_ADAPTER:-mock}
    networks:
      - holo
      - proxy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/healthz"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 15s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.holo-api.rule=Host(`holo-api.barazi.cloud`)"
      - "traefik.http.routers.holo-api.entrypoints=websecure"
      - "traefik.http.routers.holo-api.tls=true"
      - "traefik.http.routers.holo-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.holo-api.loadbalancer.server.port=4000"

  web:
    image: ghcr.io/m-barazi/holo-interface-web:latest
    container_name: holo-web
    restart: unless-stopped
    depends_on:
      server:
        condition: service_healthy
    environment:
      NODE_ENV: production
    networks:
      - holo
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.holo-web.rule=Host(`holo.barazi.cloud`)"
      - "traefik.http.routers.holo-web.entrypoints=websecure"
      - "traefik.http.routers.holo-web.tls=true"
      - "traefik.http.routers.holo-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.holo-web.loadbalancer.server.port=3000"

networks:
  holo:
    driver: bridge
  proxy:
    external: true
```

- [ ] **Step 2: Compose-Config validieren**

Run: `docker compose -f docker-compose.prod.yml config >/dev/null`
Expected: keine Reference-/Syntax-Fehler (externe Netzwerk-Referenz ist hier nur deklarativ, `config` validiert trotzdem). Falls lokal kein Docker: Schritt entfällt, CI/Deploy verifiziert.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "fix(compose): prod.yml proxy-Netz + Web-Router + CORS (VPS-Source-of-Truth)"
```

### Task 8: docker-compose.vps.yml löschen + Source-Build-Kommentar

**Files:**
- Delete: `docker-compose.vps.yml`
- Modify: `docker-compose.yml`

**Interfaces:**
- Produces: nur noch zwei Compose-Files (`docker-compose.yml` Source-Build, `docker-compose.prod.yml` GHCR/proxy).

- [ ] **Step 1: docker-compose.vps.yml löschen**

Run: `git rm docker-compose.vps.yml`

- [ ] **Step 2: Kopfkommentar in docker-compose.yml präzisieren**

`docker-compose.yml` — ersetze den Kopfkommentar (Zeilen 1-9):

```yaml
# Holo-Interface — Docker Compose (Build aus Source)
# Wird vom Hostinger-VPS (Docker-Compose-Projekt aus GitHub-Repo) verwendet.
#
# Vor dem Start eine .env alongside dieser Datei anlegen (siehe .env.example),
# zumindest NEXT_PUBLIC_SOCKET_URL / NEXT_PUBLIC_API_URL auf die öffentliche
# Server-URL setzen, damit der Browser Socket.IO erreichen kann.
#
#   cp .env.example .env   # Werte anpassen
#   docker compose up -d --build
```

durch:

```yaml
# Holo-Interface — Docker Compose (Build aus Source) — für lokale/CI-Nutzung.
# Fürs VPS-Deploy stattdessen docker-compose.prod.yml (GHCR-Images + proxy) verwenden.
#
# Vor dem Start eine .env alongside dieser Datei anlegen (siehe .env.example),
# zumindest NEXT_PUBLIC_SOCKET_URL / NEXT_PUBLIC_API_URL auf die öffentliche
# Server-URL setzen, damit der Browser Socket.IO erreichen kann.
#
#   cp .env.example .env   # Werte anpassen
#   docker compose up -d --build
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore(compose): vps.yml gelöscht, Source-Build-Kommentar präzisiert"
```

---

## Phase 4 — Server-Robustheit

### Task 9: SIGTERM-Graceful-Shutdown + io.close + Test

**Files:**
- Create: `apps/server/src/shutdown.ts`
- Create: `apps/server/src/__tests__/shutdown.test.ts`
- Modify: `apps/server/src/index.ts`

**Interfaces:**
- Produces: `registerShutdown(server: RunningServer, opts?: { timeoutMs?: number; signal?: NodeJS.Signals[]; process?: NodeJS.Process }): void` aus `./shutdown.js`.
- Consumes: `RunningServer` (aus `./index.js`) mit `close(): Promise<void>`.
- `RunningServer.close` wird so erweitert, dass es auch `io.close()` aufruft.

- [ ] **Step 1: Failing Test schreiben**

Datei `apps/server/src/__tests__/shutdown.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { registerShutdown } from '../shutdown';

function makeFakeServer(close: () => Promise<void> | Promise<unknown>) {
  return { close } as unknown as Parameters<typeof registerShutdown>[0];
}

function makeFakeProcess() {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  return {
    on: vi.fn((sig: string, fn: (...args: unknown[]) => void) => {
      handlers.set(sig, fn);
    }),
    exit: vi.fn((code?: number) => code),
    emit: (sig: string) => handlers.get(sig)?.(sig),
  } as unknown as NodeJS.Process;
}

describe('registerShutdown', () => {
  it('schließt den Server bei SIGTERM und beendet mit Code 0', async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const proc = makeFakeProcess();
    registerShutdown(makeFakeServer(close), { process: proc, timeoutMs: 1000 });

    proc.emit('SIGTERM');
    await new Promise((r) => setTimeout(r, 20));

    expect(close).toHaveBeenCalledTimes(1);
    expect(proc.exit).toHaveBeenCalledWith(0);
  });

  it('erzwingt Exit nach Timeout, wenn close hängt', async () => {
    const close = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const proc = makeFakeProcess();
    registerShutdown(makeFakeServer(close), { process: proc, timeoutMs: 30 });

    proc.emit('SIGTERM');
    await new Promise((r) => setTimeout(r, 80));

    expect(proc.exit).toHaveBeenCalledWith(0);
  });

  it('ignoriert wiederholte Signale (Idempotenz)', async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const proc = makeFakeProcess();
    registerShutdown(makeFakeServer(close), { process: proc, timeoutMs: 1000 });

    proc.emit('SIGTERM');
    proc.emit('SIGTERM');
    await new Promise((r) => setTimeout(r, 20));

    expect(close).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Test scheitern lassen**

Run: `pnpm --filter @holo/server test -- shutdown`
Expected: FAIL mit „Cannot find module '../shutdown'" o.ä.

- [ ] **Step 3: shutdown.ts implementieren**

Datei `apps/server/src/shutdown.ts`:

```ts
import type { RunningServer } from './index.js';

export interface ShutdownOptions {
  /** Harter Timeout in ms, falls close() nicht abschließt. Default 10000. */
  timeoutMs?: number;
  /** Signale, die den Shutdown auslösen. Default ['SIGTERM','SIGINT']. */
  signal?: NodeJS.Signals[];
  /** Injektionspunkt für Tests. Default process. */
  process?: NodeJS.Process;
}

/**
 * Registriert Signal-Handler, die den Server graceful herunterfahren:
 * http + Socket.IO schließen, dann Exit 0. Ein Timeout-Fallback stellt
 * sicher, dass hängende Connections (z.B. beim Traefik-Drain) den
 * Container-Stop nicht blockieren.
 */
export function registerShutdown(server: RunningServer, opts: ShutdownOptions = {}): void {
  const proc = opts.process ?? process;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const signals = opts.signal ?? (['SIGTERM', 'SIGINT'] as NodeJS.Signals[]);
  let closing = false;

  const onSignal = () => {
    if (closing) return;
    closing = true;
    Promise.race([
      server.close(),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]).finally(() => proc.exit(0));
  };

  for (const sig of signals) proc.on(sig, onSignal);
}
```

- [ ] **Step 4: Test grün werden lassen**

Run: `pnpm --filter @holo/server test -- shutdown`
Expected: PASS (3 Tests).

- [ ] **Step 5: index.ts — close() schließt io; Bootstrap registriert Shutdown**

`apps/server/src/index.ts` — ersetze den `close`-Return:

```ts
  return {
    http: httpServer,
    io,
    port: actualPort,
    close: () => new Promise((resolve) => httpServer.close(() => resolve())),
  };
```

durch:

```ts
  return {
    http: httpServer,
    io,
    port: actualPort,
    close: async () => {
      io.close();
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    },
  };
```

Und ersetze den Bootstrap-Block am Dateiende:

```ts
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  createServer({ port, corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });
  console.log(`[server] listening on :${port}`);
}
```

durch:

```ts
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  const server = await createServer({ port, corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });
  console.log(`[server] listening on :${port}`);
  registerShutdown(server);
}
```

Ergänze den Import oben in `index.ts` (nach dem bestehenden `import { ApiError, errorHandler } from './rest/error.js';`):

```ts
import { registerShutdown } from './shutdown.js';
```

Hinweis: Top-Level `await` ist erlaubt, da `@holo/server` `"type": "module"` ist und `module: ESNext`/`moduleResolution: Bundler` gelten.

- [ ] **Step 6: Bestehende Server-Tests verifizieren**

Run: `pnpm --filter @holo/server test`
Expected: alle grün (bootstrap + simulator + mock-adapter + shutdown). `bootstrap.test.ts` ruft `srv.close()` in `afterAll` — die erweiterte `close()` (mit `io.close()`) muss das weiterhin sauber erledigen.

- [ ] **Step 7: Typecheck**

Run: `pnpm --filter @holo/server typecheck`
Expected: grün (keine zirkulären Typ-Probleme durch `shutdown.ts` → `RunningServer`-Typ).

- [ ] **Step 8: Commit**

```bash
git add apps/server/src/shutdown.ts apps/server/src/__tests__/shutdown.test.ts apps/server/src/index.ts
git commit -m "feat(server): SIGTERM-Graceful-Shutdown + io.close"
```

---

## Abschluss-Verifikation (nach allen Phasen)

- [ ] **Voller Repo-Durchlauf**

Run: `pnpm install && pnpm -r typecheck && pnpm -r lint && pnpm -r test && pnpm --filter @holo/web build && pnpm --filter @holo/server build`
Expected: alles grün.

- [ ] **Compose-Files Konsistenz**

Run: `ls docker-compose*.yml`
Expected: genau `docker-compose.yml` + `docker-compose.prod.yml` (keine `vps.yml` mehr).

- [ ] **Push + CI**

```bash
git push origin main
```
CI (`.github/workflows/ci.yml`): quality-Job (typecheck→test→build) + docker-Job (smoke build) beide grün; `docker-publish.yml` published beide GHCR-Images neu.