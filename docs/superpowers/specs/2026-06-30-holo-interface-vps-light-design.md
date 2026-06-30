# Holo-Interface — VPS-Light (Code + GitHub-Seite)

**Datum:** 2026-06-30
**Scope:** Nur Code- und GitHub-Seite (Repo, Build, CI, Docker-Images, Compose). Kein VPS-Deploy, kein lokales Ausführen in diesem Schritt.
**Ziel:** Repo A-Z geprüft, server- und Hostinger-VPS-tauglich, schlank für die 1-CPU/4-GB-VPS-Maschine, schneller First-Load. Konservativ, kein Verhaltenswechsel.

## Entscheidungen

- **Optimierungs-Tiefe:** Konservativ + Bundle-Optimierung (Aufräumen + Bundle-Perf ohne Behavior-Change).
- **Lint-Strategie:** Lint reparieren + im Build aktivieren (Web-spezifische ESLint-Config, `ignoreDuringBuilds` entfernen).
- **Compose-Files:** Auf 2 Files konsolidieren (`docker-compose.yml` Source-Build + `docker-compose.prod.yml` GHCR/proxy, Single Source of Truth). `docker-compose.vps.yml` löschen.

## Ansatz

Thematische Phasen in Folge (Ansatz A) — 4 thematische Commits/PRs, jeder einzeln per CI verifizierbar und rollbackbar. Passt zur Turborepo-Struktur; fehleranfällige Punkte (z.B. drei-Subpath-Import) sind isoliert nachjustierbar.

## Phase 1 — Build-Pipeline korrigieren

**Ziel:** CI/Build zuverlässig ohne `ignoreDuringBuilds`-Workaround; `turbo` cached korrekt.

**Änderungen:**
- `apps/web/.eslintrc.cjs` (neu): extendiert `next/core-web-vitals` + `plugin:@typescript-eslint/recommended`, Parser `@typescript-eslint/parser`. Nur Web-seitig.
- Root `.eslintrc.cjs`: bleibt unverändert für node-seitige Packages (shared/server).
- `apps/web/next.config.mjs`: `eslint: { ignoreDuringBuilds: true }` entfernen.
- `turbo.json`: `typecheck` und `test` hängen aktuell an `^build` → auf `^lint` bzw. Topologie-Inputs umstellen, damit Typecheck nicht jeden Build forciert.
- `apps/web/package.json` devDependencies: `eslint-config-next`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` ergänzen (falls noch nicht vorhanden).

**Fehlerbehandlung:** Schlägt `next build`-Lint auf bestehendem Code fehl, werden nur echte Verstöße gefixt (kein `// eslint-disable`-Flucht). CI bricht sauber mit Lint-Report ab.

**Verifikation:** `pnpm lint` + `pnpm typecheck` + `pnpm build` grün im CI-Job.

## Phase 2 — Bundle/Deps schlank

**Ziel:** Client-Bundle kleiner, schneller First-Load, kein Verhaltenswechsel.

**Änderungen:**
- `apps/web/package.json`: `recharts` entfernen (kein Import im Code → toter Ballast).
- `@react-three/drei`-Importe: `OrbitControls` etc. via Subpath `@react-three/drei/core/OrbitControls` importieren → verkleinert dynamischen Chunk.
- `apps/web/next.config.mjs`: `experimental.optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-*', '@react-three/drei']`.
- `framer-motion` via `LazyMotion` + `features`-Split laden (web, ui, three-avatar) — nur benötigte Feature-Bundles.

**Fehlerbehandlung:** Subpath-Importe können in drei v9 brechen → vor Commit im `three-avatar`-Build verifizieren; bei Inkompatibilität auf `optimizePackageImports`-Äquivalent ausweichen und Subpath weglassen.

**Verifikation:** `pnpm build` grün; Holo-Avatar/Animationen rendern unverändert (visuelle Prüfung). Optional `@next/bundle-analyzer` für Vorher/Nachher-Vergleich.

## Phase 3 — Docker/Compose konsolidieren

**Ziel:** Ein Source-of-Truth fürs VPS-Deploy, schlankes Server-Image, keine Compose-Drift.

**Änderungen:**
- `docker-compose.yml`: bleibt Source-Build für lokal/CI, Kopfkommentar mit Zweck.
- `docker-compose.prod.yml`: GHCR-Images, **ergänzt fehlendes `proxy`-Netzwerk** (external) + Traefik-Labels für `holo.barazi.cloud`/`holo-api.barazi.cloud`, CORS-Origin. Single Source of Truth für VPS.
- `docker-compose.vps.yml`: **löschen** (inhaltlich in `prod.yml` aufgegangen).
- `apps/server/Dockerfile` Runner-Stage: nur noch `apps/server` + `packages/shared` installieren (nicht mehr alle Workspace-Packages inkl. tokens/ui/three-avatar) → kleiner Image, kürzerer Pull auf VPS.

**Fehlerbehandlung:** Server startet nicht, falls `shared` fehlt → Dockerfile kopiert gezielt `packages/shared` + `apps/server/package.json` und installiert nur diese. Healthcheck (`/healthz`) bleibt Drehpunkt.

**Verifikation:** `docker build` für beide Apps grün; `docker compose -f docker-compose.prod.yml config` validiert ohne Reference-Fehler.

## Phase 4 — Server-Robustheit

**Ziel:** Sauberes SIGTERM-Handling für Container-Stop/Restart auf VPS.

**Änderungen:**
- `apps/server/src/index.ts`: `process.on('SIGTERM', ...)` + `SIGINT` → `http.close()`, Socket.IO `io.close()`, dann `process.exit(0)`.

**Fehlerbehandlung:** Timeout-Fallback (10s), danach erzwungenes Exit, damit Traefik-Drain nicht blockiert.

**Verifikation:** `vitest`-Unit für Shutdown-Handler (Signal → close-Aufrufe gemockt); `pnpm test` grün.

## Übergreifend

Alle Änderungen sind code-/GitHub-seitig. Kein VPS-Deploy, kein lokales Ausführen. CI (`.github/workflows/ci.yml`) behält Struktur, läuft pro Phase neu durch.

## Out of Scope

- VPS-Deploy-Ausführung (Compose auf VPS anwenden, Traefik-Validierung live).
- Lokales Starten der App.
- Verhaltensänderungen an UI/Komponenten.
- Neue Features.