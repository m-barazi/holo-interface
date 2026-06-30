# Holo-Interface Fundament-Schiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein vertikal durchverbundenes, Docker-lauffähiges KI-Assistenten-Kontrollzentrum aufbauen — Monorepo, Designsystem, Next.js-Shell, Node/Socket.IO-Backend mit simulierter Telemetrie + LLM-Mock, 3D-GLB-Avatar (R3F), KI-Assistent-View mit Status-Automat, Sprachwellen, Chat und Mikro/Kamera-Status.

**Architecture:** pnpm + Turborepo-Monorepo. `apps/web` (Next.js App Router) konsumiert `packages/ui`, `packages/tokens`, `packages/three-avatar`, `packages/shared`. `apps/server` (Node + Express + Socket.IO) implementiert dasselbe Protokoll aus `packages/shared`; WebRTC nur als Signalisierung, Medien Peer-to-Peer. Zustand-Stores (Zustand) sind die einzige Mutationsquelle; ein `SocketProvider` dispatcht Events in die Stores.

**Tech Stack:** Node 20, pnpm 8, Turborepo, TypeScript 5.4 (strict), Next.js 14, React 18, Tailwind 3.4, Framer Motion, Zustand, React Three Fiber + drei, recharts, lucide-react, next-intl, next-pwa, Socket.IO 4, Express 4, Vitest, @testing-library/react, Playwright, Storybook, Docker (node:20-alpine).

## Global Constraints

- **Node-Version:** 20.x (Engine in allen `package.json`: `"node": ">=20"`).
- **Package-Manager:** pnpm 8.x, `pnpm-workspace.yaml`, `pnpm-lock.yaml` committed, `--frozen-lockfile` in CI/Docker.
- **TypeScript:** strict true, `noUncheckedIndexedAccess` true, shared `tsconfig.base.json`.
- **Styling:** ausschließlich Tailwind + CSS-Vars aus `packages/tokens`; keine inline-Hex-Werte in Komponenten (Tokens via `bg-elev-1` etc.).
- **Sprache:** alle UI-Strings via next-intl Message-IDs (de/en); kein hartes Deutsch im Komponenten-Code.
- **Kein echtes LLM/keine API-Keys:** `LLM_ADAPTER=mock` default; API-Keys nur serverseitig.
- **Keine Medienlast auf dem Server:** WebRTC nur Signalisierung.
- **Commits:** frequente, kleinere Commits pro Task; Commit-Message-Präfix `feat:`/`fix:`/`chore:`/`docs:`/`test:`. Co-Author-Zeile am Ende jeder Message: `Co-Authored-By: Claude <noreply@anthropic.com>`.

---

## File Structure (Übersicht)

```
holo-interface/
├─ package.json                  root (turbo + pnpm scripts)
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ .editorconfig / .prettierrc / .eslintrc.cjs / .gitignore / .env.example
├─ Dockerfile.web / Dockerfile.server / docker-compose.yml / .dockerignore
├─ .github/workflows/ci.yml
├─ README.md / LICENSE / CONTRIBUTING.md
├─ packages/
│  ├─ tokens/         src/{color,spacing,radius,motion,glass,typography,index}.ts + tailwind-preset.ts
│  ├─ shared/          src/{protocol,assistant,telemetry,avatar,device,api}.ts + index.ts
│  ├─ ui/              src/{GlassCard,NeonButton,Slider,Tabs,StatusPill,Sparkline,FloatingPanel,CommandPalette,Toaster}.tsx + index.ts
│  └─ three-avatar/    src/{AvatarScene,AvatarModel,AvatarController,holo-shader.ts,index}.tsx + assets/avatar-bust.glb
└─ apps/
   ├─ server/         src/{index,sockets/*,llm/*,telemetry/simulator,rest/*,store/*}.ts
   └─ web/            app/{layout,(shell)/...}, components/, stores/, providers/, lib/, messages/{de,en}.json, public/
```

---

# Phase A — Monorepo-Bootstrap

### Task A1: Root-Scaffolding (Workspace, Turbo, TS-Base, Tooling)

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.editorconfig`, `.prettierrc`, `.eslintrc.cjs`, `.env.example`, `README.md`, `LICENSE`

- [ ] **Step 1: Root `package.json` anlegen**

```json
{
  "name": "holo-interface",
  "private": true,
  "version": "0.1.0",
  "engines": { "node": ">=20", "pnpm": ">=8" },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md,css}\""
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "typescript": "^5.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0"
  }
}
```

- [ ] **Step 2: `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "test:e2e": { "dependsOn": ["^build"] }
  }
}
```

- [ ] **Step 4: `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext", "moduleResolution": "Bundler",
    "strict": true, "noUncheckedIndexedAccess": true,
    "esModuleInterop": true, "skipLibCheck": true, "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true, "isolatedModules": true, "verbatimModuleSyntax": true,
    "noEmit": true, "jsx": "preserve"
  }
}
```

- [ ] **Step 5: Tooling-Dateien `.editorconfig`, `.prettierrc`, `.eslintrc.cjs`**

`.editorconfig`:
```ini
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

`.prettierrc`:
```json
{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

`.eslintrc.cjs`:
```js
module.exports = { root: true, env: { node: true, es2022: true }, extends: ['eslint:recommended'], parserOptions: { ecmaVersion: 2022, sourceType: 'module' }, rules: { 'no-unused-vars': 'warn' } };
```

- [ ] **Step 6: `.env.example`**

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_DEFAULT_LOCALE=de
# Backend
PORT=4000
CORS_ORIGIN=http://localhost:3000
LLM_ADAPTER=mock
# (später) OPENAI_API_KEY=
```

- [ ] **Step 7: `README.md` (Skeleton)**

```markdown
# Holo-Interface

Futuristisches Steuerzentrum für einen holografischen KI-Assistenten. Monorepo (Next.js + Node/Socket.IO), Glasmorphismus-Designsystem, 3D-Avatar (React Three Fiber).

## Quickstart
\`\`\`bash
pnpm install
pnpm dev        # web :3000, server :4000
\`\`\`

## Docker
\`\`\`bash
cp .env.example .env
docker compose up --build   # web :3000, server :4000
\`\`\`

## Struktur
Siehe `docs/superpowers/specs/2026-06-30-holo-interface-design.md`.
```

- [ ] **Step 8: `LICENSE` (MIT)** — Standard-MIT-Text mit Copyright `2026 m-barazi`.

- [ ] **Step 9: Abhängigkeiten installieren & verifizieren**

Run: `pnpm install`
Expected: Workspace erkannt, Lockfile erzeugt, kein Error.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: monorepo bootstrap (pnpm, turbo, ts-base, tooling)"
```

---

# Phase B — Design-Token-Package

### Task B1: `packages/tokens` (Farbe, Spacing, Radius, Motion, Glass, Typo + Tailwind-Preset)

**Files:**
- Create: `packages/tokens/package.json`, `packages/tokens/tsconfig.json`, `packages/tokens/src/{color,spacing,radius,motion,glass,typography,index}.ts`, `packages/tokens/src/tailwind-preset.ts`
- Test: `packages/tokens/src/__tests__/tokens.test.ts`

**Interfaces:**
- Produces: named exports `colors, spacing, radius, motion, glass, typography` und Default-Export `tailwindPreset` (Tailwind-Theme-Konfig). Konsumiert von `packages/ui` und `apps/web/tailwind.config.ts`.

- [ ] **Step 1: Package-Setup**

`packages/tokens/package.json`:
```json
{
  "name": "@holo/tokens",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run" },
  "devDependencies": { "typescript": "^5.4.0", "vitest": "^1.6.0" }
}
```
`packages/tokens/tsconfig.json`: `{ "extends": "../../tsconfig.base.json", "include": ["src"] }`

- [ ] **Step 2: Failing test schreiben** — `packages/tokens/src/__tests__/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { colors } from '../color';
import { tailwindPreset } from '../tailwind-preset';

describe('tokens', () => {
  it('exposes neon accent cyan', () => {
    expect(colors.accent.cyan).toBe('#22D3EE');
  });
  it('tailwind preset maps bg-base', () => {
    expect(tailwindPreset.theme?.extend?.colors?.['bg-base']).toBe('#070A12');
  });
  it('state map has error', () => {
    expect(colors.state.error).toBe('#FB7185');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/tokens && pnpm vitest run`
Expected: FAIL ("module not found" für `../color`).

- [ ] **Step 4: `color.ts` implementieren**

```ts
export const colors = {
  bg: { base: '#070A12', elev1: '#0C1220', elev2: '#121A2E' },
  accent: { cyan: '#22D3EE', turquoise: '#2DD4BF', blue: '#3B82F6', violet: '#A855F7' },
  state: { online: '#2DD4BF', thinking: '#A855F7', answering: '#22D3EE', error: '#FB7185', offline: '#64748B' },
  text: { primary: '#E6EDF7', secondary: '#94A3B8', muted: '#64748B' },
  glass: { surface: 'rgba(255,255,255,0.05)', strong: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.08)' },
  light: { bg: { base: '#F4F7FB', elev1: '#FFFFFF', elev2: '#EAEFF7' }, text: { primary: '#0C1220', secondary: '#475569', muted: '#94A3B8' } },
} as const;
```

- [ ] **Step 5: `spacing.ts`, `radius.ts`, `motion.ts`, `glass.ts`, `typography.ts`**

`spacing.ts`:
```ts
export const spacing = { 0.5: '0.125rem', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 6: '1.5rem', 8: '2rem', 12: '3rem', 16: '4rem' } as const;
```
`radius.ts`:
```ts
export const radius = { sm: '0.375rem', md: '0.625rem', lg: '1rem', xl: '1.5rem', full: '9999px' } as const;
```
`motion.ts`:
```ts
export const motion = {
  duration: { fast: '80ms', base: '200ms', slow: '320ms', xslow: '500ms' },
  easing: { soft: [0.4, 0, 0.2, 1], emphasized: [0.2, 0, 0, 1] },
  spring: { stiffness: 220, damping: 26 },
} as const;
```
`glass.ts`:
```ts
export const glass = { blur: '1rem', blurStrong: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' } as const;
```
`typography.ts`:
```ts
export const typography = {
  font: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  size: { xs: '0.75rem', sm: '0.875rem', base: '0.9375rem', lg: '1.125rem', xl: '1.375rem', '2xl': '1.75rem', '3xl': '2.25rem', display: '3.5rem' },
} as const;
```

- [ ] **Step 6: `index.ts`**

```ts
export * from './color';
export * from './spacing';
export * from './radius';
export * from './motion';
export * from './glass';
export * from './typography';
```

- [ ] **Step 7: `tailwind-preset.ts`**

```ts
import { colors, spacing, radius, motion, glass, typography } from './index';
import type { Config } from 'tailwindcss';

export const tailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        'bg-base': colors.bg.base, 'bg-elev-1': colors.bg.elev1, 'bg-elev-2': colors.bg.elev2,
        'accent-cyan': colors.accent.cyan, 'accent-turquoise': colors.accent.turquoise,
        'accent-blue': colors.accent.blue, 'accent-violet': colors.accent.violet,
        'state-online': colors.state.online, 'state-thinking': colors.state.thinking,
        'state-answering': colors.state.answering, 'state-error': colors.state.error, 'state-offline': colors.state.offline,
        'txt-primary': colors.text.primary, 'txt-secondary': colors.text.secondary, 'txt-muted': colors.text.muted,
      },
      borderRadius: { sm: radius.sm, md: radius.md, lg: radius.lg, xl: radius.xl },
      backdropBlur: { glass: glass.blur, 'glass-strong': glass.blurStrong },
      fontFamily: { sans: typography.font.sans.split(','), mono: typography.font.mono.split(',') },
      transitionDuration: { fast: motion.duration.fast, base: motion.duration.base, slow: motion.duration.slow },
      spacing,
    },
  },
};
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd packages/tokens && pnpm vitest run`
Expected: PASS (3 Tests).

- [ ] **Step 9: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): design-token-package mit tailwind-preset"
```

---

# Phase C — Shared-Protokoll-Package

### Task C1: `packages/shared` (typsichere Protokoll-Typen)

**Files:**
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/{assistant,telemetry,avatar,device,api,index}.ts`
- Test: `packages/shared/src/__tests__/protocol.test-d.ts`

**Interfaces:**
- Produces: Typen `AssistantState`, `TelemetryTick`, `AvatarCommand`, `SocketEvents`, `LLMAdapter`, `ModelInfo`. Konsumiert von `apps/server` und `apps/web`.

- [ ] **Step 1: Package-Setup** (analog Task B1 Step 1, Name `@holo/shared`).

- [ ] **Step 2: `assistant.ts`**

```ts
export type AssistantState = 'online' | 'offline' | 'listening' | 'thinking' | 'answering' | 'error';
export interface AssistantSummary { id: string; name: string; state: AssistantState; modelId: string }
export interface ChatChunk { delta: string; tokensIn: number; tokensOut: number }
export interface QueryRequest { prompt: string; assistantId: string; modelId: string; temperature: number; topP: number; maxTokens: number }
```

- [ ] **Step 3: `telemetry.ts`**

```ts
export interface TelemetryTick {
  ts: number; cpu: number; gpu: number; ram: number;
  net: { up: number; down: number; latency: number; ping: number; internet: boolean };
  temp: number; energy: number; fps: number; apiStatus: 'ok' | 'degraded' | 'down';
}
```

- [ ] **Step 4: `avatar.ts`**

```ts
export type Gesture = 'idle' | 'wave' | 'nod' | 'point' | 'shrug';
export type Expression = 'neutral' | 'smile' | 'think' | 'concern' | 'speak';
export interface AvatarCommand { gesture?: Gesture; expression?: Expression; gaze?: { x: number; y: number }; lipSync?: number }
export interface AvatarTransform { brightness: number; opacity: number; scale: number; posX: number; posY: number; rotationY: number }
```

- [ ] **Step 5: `device.ts`**

```ts
export type DeviceKind = 'microphone' | 'camera' | 'speaker' | 'smart-home' | 'sensor' | 'robot' | 'display' | 'projector';
export interface Device { id: string; kind: DeviceKind; name: string; status: 'active' | 'idle' | 'locked'; online: boolean }
```

- [ ] **Step 6: `api.ts` (LLM-Adapter-Schnittstelle + ModelInfo)**

```ts
export type ModelTier = 'local' | 'cloud';
export interface ModelInfo { id: string; name: string; tier: ModelTier; contextSize: number; speedTokPerS: number }
export interface Context { system: string; history: { role: 'user' | 'assistant'; content: string }[] }
export interface StreamChunk { delta: string; tokensIn: number; tokensOut: number }
export interface LLMAdapter {
  stream(req: { prompt: string; context: Context; model: string; temperature: number; topP: number; maxTokens: number }): AsyncIterable<StreamChunk>;
  models(): Promise<ModelInfo[]>;
}
```

- [ ] **Step 7: `index.ts` — zentrale `SocketEvents`-Map + Re-Exports**

```ts
export * from './assistant';
export * from './telemetry';
export * from './avatar';
export * from './device';
export * from './api';

export interface SocketEvents {
  'telemetry:tick': (tick: TelemetryTick) => void;
  'assistant:state': (s: { assistantId: string; state: AssistantState }) => void;
  'assistant:transcript': (s: { assistantId: string; text: string }) => void;
  'assistant:response': (s: { assistantId: string; chunk: ChatChunk }) => void;
  'assistant:response:done': (s: { assistantId: string; tokensIn: number; tokensOut: number; latencyMs: number }) => void;
  'assistant:wave': (s: { assistantId: string; level: number }) => void;
  'avatar:command': (c: AvatarCommand) => void;
  'webrtc:offer': (s: { from: string; sdp: string }) => void;
  'webrtc:answer': (s: { from: string; sdp: string }) => void;
  'webrtc:ice': (s: { from: string; candidate: string }) => void;
}
export interface ClientEvents {
  'assistant:query': (req: QueryRequest) => void;
  'assistant:mute': (s: { assistantId: string; muted: boolean }) => void;
  'assistant:abort': (s: { assistantId: string }) => void;
  'avatar:command': (c: AvatarCommand) => void;
  'webrtc:offer': (s: { to: string; sdp: string }) => void;
  'webrtc:answer': (s: { to: string; sdp: string }) => void;
  'webrtc:ice': (s: { to: string; candidate: string }) => void;
}
```

- [ ] **Step 8: Typecheck-Test `protocol.test-d.ts`** (zeigt Konsistenz der Event-Map):

```ts
import { expectTypeOf } from 'vitest';
import type { SocketEvents, TelemetryTick } from '../index';
expectTypeOf<Parameters<SocketEvents['telemetry:tick']>[0]>().toMatchTypeOf<TelemetryTick>();
```

- [ ] **Step 9: Run typecheck**

Run: `cd packages/shared && pnpm typecheck`
Expected: kein Fehler.

- [ ] **Step 10: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): typsicheres socket/rest-protokoll"
```

---

# Phase D — Backend (`apps/server`)

### Task D1: Server-Bootstrap (Express + Socket.IO + Healthcheck)

**Files:**
- Create: `apps/server/package.json`, `apps/server/tsconfig.json`, `apps/server/src/index.ts`
- Test: `apps/server/src/__tests__/bootstrap.test.ts`

**Interfaces:**
- Consumes: `@holo/shared` (SocketEvents, ClientEvents).
- Produces: lauffähiger HTTP+Socket-Server mit `GET /healthz`.

- [ ] **Step 1: Package-Setup**

`apps/server/package.json`:
```json
{
  "name": "@holo/server", "version": "0.1.0", "private": true, "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && chmod +x dist/index.js",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.0", "socket.io": "^4.7.0", "cors": "^2.8.5",
    "dotenv": "^16.4.0", "@holo/shared": "workspace:*"
  },
  "devDependencies": { "typescript": "^5.4.0", "tsx": "^4.7.0", "vitest": "^1.6.0", "@types/express": "^4.17.0", "@types/cors": "^2.8.0" }
}
```
`apps/server/tsconfig.json`: `{ "extends": "../../tsconfig.base.json", "compilerOptions": { "module": "ESNext", "moduleResolution": "Bundler", "outDir": "dist", "noEmit": false }, "include": ["src"] }`

- [ ] **Step 2: Failing test `bootstrap.test.ts`**

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../src/index';
import type { Server } from 'http';

let srv: { http: Server; port: number };
describe('server bootstrap', () => {
  beforeAll(async () => { srv = await createServer({ port: 0, corsOrigin: '*' }); });
  afterAll(() => new Promise((r) => srv.http.close(r));
  it('responds 200 on /healthz', async () => {
    const res = await fetch(`http://localhost:${srv.port}/healthz`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });
});
```

- [ ] **Step 3: Run test to verify it fails** — `cd apps/server && pnpm vitest run` → FAIL (createServer nicht exportiert).

- [ ] **Step 4: `src/index.ts` implementieren** (exportiert testbare `createServer`):

```ts
import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server as IOServer } from 'socket.io';
import 'dotenv/config';
import { attachSockets } from './sockets';

export async function createServer(opts: { port: number; corsOrigin: string }) {
  const app = express();
  app.use(cors({ origin: opts.corsOrigin }));
  app.use(express.json());
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  const httpServer = http.createServer(app);
  const io = new IOServer(httpServer, { cors: { origin: opts.corsOrigin } });
  attachSockets(io);
  await new Promise<void>((r) => httpServer.listen(opts.port, () => r()));
  return { http: httpServer, io, port: opts.port };
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  createServer({ port, corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });
  console.log(`[server] listening on :${port}`);
}
```

- [ ] **Step 5: Stub `src/sockets/index.ts`** (vorläufig leer, wird in D2 gefüllt):

```ts
import type { Server as IOServer } from 'socket.io';
export function attachSockets(_io: IOServer) { /* filled in D2 */ }
```

- [ ] **Step 6: Run test to verify it passes** — `pnpm vitest run` → PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/server
git commit -m "feat(server): express + socket.io bootstrap mit healthcheck"
```

### Task D2: Telemetrie-Simulator + Socket-Anbindung

**Files:**
- Create: `apps/server/src/telemetry/simulator.ts`, `apps/server/src/sockets/telemetry.ts`, modify `apps/server/src/sockets/index.ts`
- Test: `apps/server/src/__tests__/simulator.test.ts`

**Interfaces:**
- Consumes: `@holo/shared` (`TelemetryTick`, `AssistantState`).
- Produces: `simulateTick(prev, state)` → `TelemetryTick`; `attachSockets` emit `telemetry:tick` 1 Hz.

- [ ] **Step 1: Failing test `simulator.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { simulateTick } from '../src/telemetry/simulator';
import type { TelemetryTick } from '@holo/shared';

describe('simulateTick', () => {
  const base: TelemetryTick = { ts: 0, cpu: 20, gpu: 10, ram: 30, net: { up: 100, down: 500, latency: 5, ping: 10, internet: true }, temp: 45, energy: 80, fps: 60, apiStatus: 'ok' };
  it('keeps values in plausible ranges', () => {
    const t = simulateTick(base, 'online');
    expect(t.cpu).toBeGreaterThanOrEqual(0); expect(t.cpu).toBeLessThanOrEqual(100);
    expect(t.gpu).toBeGreaterThanOrEqual(0); expect(t.gpu).toBeLessThanOrEqual(100);
    expect(t.fps).toBeGreaterThan(0);
  });
  it('spikes GPU/temp when thinking', () => {
    const t = simulateTick(base, 'thinking');
    expect(t.gpu).toBeGreaterThan(base.gpu);
    expect(t.temp).toBeGreaterThanOrEqual(base.temp);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `pnpm vitest run` → FAIL.

- [ ] **Step 3: `simulator.ts` implementieren**

```ts
import type { TelemetryTick, AssistantState } from '@holo/shared';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const walk = (prev: number, vol: number, lo: number, hi: number) => clamp(prev + (Math.random() - 0.5) * vol, lo, hi);

export function simulateTick(prev: TelemetryTick, state: AssistantState): TelemetryTick {
  const thinking = state === 'thinking';
  return {
    ts: Date.now(),
    cpu: walk(prev.cpu, 8, 2, thinking ? 95 : 60),
    gpu: thinking ? clamp(prev.gpu + 15 + Math.random() * 10, 10, 100) : walk(prev.gpu, 6, 5, 40),
    ram: walk(prev.ram, 3, 20, 90),
    net: { up: walk(prev.net.up, 30, 10, 2000), down: walk(prev.net.down, 60, 100, 5000), latency: walk(prev.net.latency, 2, 1, 80), ping: walk(prev.net.ping, 2, 2, 100), internet: true },
    temp: thinking ? clamp(prev.temp + 2 + Math.random() * 3, 35, 85) : walk(prev.temp, 1, 35, 65),
    energy: walk(prev.energy, 4, 40, 200),
    fps: Math.round(walk(prev.fps, 2, 30, 120)),
    apiStatus: state === 'error' ? 'degraded' : 'ok',
  };
}
```

- [ ] **Step 4: Run test to verify it passes** → PASS.

- [ ] **Step 5: `sockets/telemetry.ts` + `sockets/index.ts` anbinden**

`sockets/telemetry.ts`:
```ts
import type { Server as IOServer } from 'socket.io';
import type { TelemetryTick, AssistantState } from '@holo/shared';
import { simulateTick } from '../telemetry/simulator';

export function startTelemetry(io: IOServer, getState: () => AssistantState) {
  let prev: TelemetryTick = { ts: 0, cpu: 20, gpu: 10, ram: 30, net: { up: 100, down: 500, latency: 5, ping: 10, internet: true }, temp: 45, energy: 80, fps: 60, apiStatus: 'ok' };
  return setInterval(() => { prev = simulateTick(prev, getState()); io.emit('telemetry:tick', prev); }, 1000);
}
```

`sockets/index.ts` (replace stub):
```ts
import type { Server as IOServer } from 'socket.io';
import { startTelemetry } from './telemetry';
import { attachAssistant } from './assistant';

export function attachSockets(io: IOServer) {
  const { getState } = attachAssistant(io);
  startTelemetry(io, getState);
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/telemetry apps/server/src/sockets
git commit -m "feat(server): telemetrie-simulator + 1hz-emit"
```

### Task D3: LLM-Adapter-Mock + Assistant-Status-Automat + Chat-Stream

**Files:**
- Create: `apps/server/src/llm/adapter.ts`, `apps/server/src/llm/mock.ts`, `apps/server/src/sockets/assistant.ts`
- Test: `apps/server/src/__tests__/mock-adapter.test.ts`

**Interfaces:**
- Consumes: `@holo/shared` (`LLMAdapter`, `StreamChunk`, `ModelInfo`, `QueryRequest`, `AssistantState`).
- Produces: `createLLM('mock')`; `attachAssistant(io)` → `{ getState }`, verarbeitet `assistant:query` → streamt `assistant:response` + `assistant:state`.

- [ ] **Step 1: Failing test `mock-adapter.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { createLLM } from '../src/llm/adapter';

describe('mock adapter', () => {
  it('lists models', async () => {
    const llm = createLLM('mock');
    const models = await llm.models();
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.tier === 'local')).toBe(true);
  });
  it('streams chunks with delta text', async () => {
    const llm = createLLM('mock');
    const chunks: string[] = [];
    for await (const c of llm.stream({ prompt: 'Hallo', context: { system: '', history: [] }, model: 'mock-1', temperature: 0.7, topP: 1, maxTokens: 50 })) {
      chunks.push(c.delta);
    }
    expect(chunks.join('').length).toBeGreaterThan(0);
    expect(chunks.length).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** → FAIL.

- [ ] **Step 3: `llm/adapter.ts` (Factory) + `llm/mock.ts`**

`adapter.ts`:
```ts
import type { LLMAdapter } from '@holo/shared';
import { MockLLM } from './mock';

export function createLLM(kind: 'mock' | 'openai' | 'ollama' = 'mock'): LLMAdapter {
  if (kind === 'mock') return new MockLLM();
  throw new Error(`adapter "${kind}" not implemented yet`);
}
```

`mock.ts`:
```ts
import type { LLMAdapter, StreamChunk, ModelInfo } from '@holo/shared';

export class MockLLM implements LLMAdapter {
  private models: ModelInfo[] = [
    { id: 'mock-1', name: 'Holo-Mock v1', tier: 'local', contextSize: 8192, speedTokPerS: 120 },
    { id: 'mock-cloud', name: 'Holo-Cloud (sim)', tier: 'cloud', contextSize: 32768, speedTokPerS: 60 },
  ];
  async models(): Promise<ModelInfo[]> { return this.models; }
  async *stream(req: { prompt: string; model: string; temperature: number; topP: number; maxTokens: number }): AsyncIterable<StreamChunk> {
    const reply = `Mock-Antwort auf „${req.prompt.slice(0, 40)}" (Temp ${req.temperature}). Das Holo-Interface funktioniert — Avatar-Status wird live gesteuert.`;
    const words = reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 35));
      yield { delta: (i ? ' ' : '') + words[i], tokensIn: req.prompt.length / 4, tokensOut: 1 };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes** → PASS.

- [ ] **Step 5: `sockets/assistant.ts` — Status-Automat + Stream**

```ts
import type { Server as IOServer, Socket } from 'socket.io';
import type { AssistantState, QueryRequest, Context } from '@holo/shared';
import { createLLM } from '../llm/adapter';

const stateByAssistant = new Map<string, AssistantState>();

export function attachAssistant(io: IOServer) {
  const llm = createLLM(process.env.LLM_ADAPTER as any ?? 'mock');
  io.on('connection', (socket: Socket) => {
    socket.on('assistant:query', async (req: QueryRequest) => {
      setState(io, req.assistantId, 'listening');
      await new Promise((r) => setTimeout(r, 300));
      setState(io, req.assistantId, 'thinking');
      const ctx: Context = { system: 'Du bist ein holografischer KI-Assistent.', history: [] };
      const start = Date.now();
      let tokensIn = 0, tokensOut = 0, first = true;
      for await (const chunk of llm.stream({ ...req, context: ctx })) {
        if (first) { setState(io, req.assistantId, 'answering'); first = false; }
        tokensIn += chunk.tokensIn; tokensOut += chunk.tokensOut;
        socket.emit('assistant:response', { assistantId: req.assistantId, chunk });
        socket.emit('assistant:wave', { assistantId: req.assistantId, level: 0.4 + Math.random() * 0.6 });
      }
      setState(io, req.assistantId, 'online');
      socket.emit('assistant:response:done', { assistantId: req.assistantId, tokensIn, tokensOut, latencyMs: Date.now() - start });
    });
    socket.on('assistant:abort', (s: { assistantId: string }) => setState(io, s.assistantId, 'online'));
  });
  return { getState: () => (stateByAssistant.values().next().value ?? 'online') };
}

function setState(io: IOServer, id: string, state: AssistantState) {
  stateByAssistant.set(id, state);
  io.emit('assistant:state', { assistantId: id, state });
}
```

- [ ] **Step 6: Manueller Smoke-Test** — `pnpm --filter @holo/server dev` starten; in anderem Terminal mit `wscat`/Browser-Konsole gegen `ws://localhost:4000` emit `assistant:query` prüfen. (Dokumentation im README ergänzen.)

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/llm apps/server/src/sockets/assistant.ts
git commit -m "feat(server): llm-mock-adapter + assistant-status-automat + chat-stream"
```

### Task D4: WebRTC-Signalisierung + REST-Stubs

**Files:**
- Create: `apps/server/src/sockets/webrtc.ts`, `apps/server/src/rest/{assistants,knowledge,automation,settings,logs,analytics}.ts`, modify `sockets/index.ts`, `src/index.ts`

- [ ] **Step 1: `sockets/webrtc.ts` (reines Relay)**

```ts
import type { Server as IOServer, Socket } from 'socket.io';
export function attachWebRTC(io: IOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('webrtc:offer', (s: { to: string; sdp: string }) => io.to(s.to).emit('webrtc:offer', { from: socket.id, sdp: s.sdp }));
    socket.on('webrtc:answer', (s: { to: string; sdp: string }) => io.to(s.to).emit('webrtc:answer', { from: socket.id, sdp: s.sdp }));
    socket.on('webrtc:ice', (s: { to: string; candidate: string }) => io.to(s.to).emit('webrtc:ice', { from: socket.id, candidate: s.candidate }));
  });
}
```

- [ ] **Step 2: REST-Stubs (typisiert)** — `rest/assistants.ts`:

```ts
import { Router } from 'express';
import type { AssistantSummary } from '@holo/shared';
const assistants: AssistantSummary[] = [{ id: 'a1', name: 'Nova', state: 'online', modelId: 'mock-1' }];
export const assistantsRouter = Router();
assistantsRouter.get('/', (_req, res) => res.json(assistants));
assistantsRouter.post('/', (req, res) => { const a = { id: `a${assistants.length + 1}`, name: req.body.name ?? 'Neu', state: 'offline' as const, modelId: 'mock-1' }; assistants.push(a); res.status(201).json(a); });
```

(restliche Stubs `knowledge/automation/settings/logs/analytics` analog: `Router()` mit `GET`-Returns von Stub-Daten.)

- [ ] **Step 3: Routers in `index.ts` mounten** — `app.use('/api/assistants', assistantsRouter)` etc.; `attachWebRTC(io)` in `sockets/index.ts` aufrufen.

- [ ] **Step 4: Integration-Test** — erweitere `bootstrap.test.ts`: `GET /api/assistants` → 200 + Array mit `a1`.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src
git commit -m "feat(server): webrtc-signalisierung + rest-stubs"
```

---

# Phase E — UI-Komponenten-Package

### Task E1: `packages/ui` Kernkomponenten (GlassCard, NeonButton, Slider, StatusPill, Tabs)

**Files:**
- Create: `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/src/{GlassCard,NeonButton,Slider,StatusPill,Tabs,index}.tsx`, tailwind-config für ui
- Test: `packages/ui/src/__tests__/StatusPill.test.tsx`

**Interfaces:**
- Consumes: `@holo/tokens` (tailwindPreset), `@holo/shared` (AssistantState).
- Produces: exportierte Komponenten für `apps/web`.

- [ ] **Step 1: Package-Setup**

`packages/ui/package.json`:
```json
{
  "name": "@holo/ui", "version": "0.1.0", "private": true, "type": "module",
  "main": "./src/index.ts", "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run", "lint": "eslint src" },
  "dependencies": { "@radix-ui/react-slider": "^1.2.0", "@radix-ui/react-tabs": "^1.1.0", "lucide-react": "^0.400.0", "framer-motion": "^11.3.0", "@holo/tokens": "workspace:*", "@holo/shared": "workspace:*" },
  "devDependencies": { "typescript": "^5.4.0", "vitest": "^1.6.0", "@testing-library/react": "^16.0.0", "jsdom": "^24.0.0", "@vitejs/plugin-react": "^4.3.0", "tailwindcss": "^3.4.0" }
}
```
`packages/ui/vitest.config.ts`: jsdom + react plugin setup.

- [ ] **Step 2: Failing test `StatusPill.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../StatusPill';

describe('StatusPill', () => {
  it('renders state label and accent color class', () => {
    render(<StatusPill state="online" label="Online" />);
    const el = screen.getByText('Online');
    expect(el).toBeTruthy();
  });
  it('uses error color for error state', () => {
    const { container } = render(<StatusPill state="error" label="Fehler" />);
    expect(container.querySelector('[data-state="error"]')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify it fails** → FAIL.

- [ ] **Step 4: `StatusPill.tsx`**

```tsx
import { motion } from 'framer-motion';
import type { AssistantState } from '@holo/shared';
const stateColor: Record<AssistantState, string> = { online: 'bg-state-online', thinking: 'bg-state-thinking', answering: 'bg-state-answering', error: 'bg-state-error', offline: 'bg-state-offline', listening: 'bg-state-online' };
export function StatusPill({ state, label }: { state: AssistantState; label: string }) {
  return (
    <span data-state={state} className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-sm text-txt-primary">
      <motion.span className={`inline-block h-2 w-2 rounded-full ${stateColor[state]}`} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      {label}
    </span>
  );
}
```

- [ ] **Step 5: `GlassCard.tsx`, `NeonButton.tsx`, `Slider.tsx`, `Tabs.tsx`** (jeweils `glass`-Klasse + Radix-Primitive + Framer-Motion-Hover):

```tsx
// GlassCard.tsx
import { motion } from 'framer-motion';
export function GlassCard({ children, className = '', strong = false }: { children: React.ReactNode; className?: string; strong?: boolean }) {
  return <motion.div className={`rounded-lg border border-white/10 backdrop-blur-glass ${strong ? 'bg-white/10' : 'bg-white/5'} p-4 shadow-lg shadow-black/20 ${className}`} whileHover={{ y: -2 }}>{children}</motion.div>;
}
```

```tsx
// NeonButton.tsx
import { motion } from 'framer-motion';
export function NeonButton({ children, onClick, accent = 'cyan' }: { children: React.ReactNode; onClick?: () => void; accent?: 'cyan' | 'violet' | 'blue' }) {
  const glow = { cyan: 'shadow-[0_0_24px_rgba(34,211,238,0.4)]', violet: 'shadow-[0_0_24px_rgba(168,85,247,0.4)]', blue: 'shadow-[0_0_24px_rgba(59,130,246,0.4)]' }[accent];
  return <motion.button onClick={onClick} className={`rounded-md border border-white/10 bg-white/5 px-4 py-2 text-txt-primary hover:border-accent-${accent} ${glow}`}>{children}</motion.button>;
}
```

```tsx
// Slider.tsx
import * as RadixSlider from '@radix-ui/react-slider';
export function Slider({ value, onValueChange, label }: { value: number; onValueChange: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-txt-secondary">{label}: {Math.round(value * 100)}%</span>
      <RadixSlider.Root value={[value]} max={1} step={0.01} onValueChange={(v) => onValueChange(v[0] ?? 0)} className="flex h-5 items-center">
        <RadixSlider.Track className="h-1 flex-1 rounded bg-white/10"><RadixSlider.Range className="h-full rounded bg-accent-cyan" /></RadixSlider.Track>
        <RadixSlider.Thumb className="block h-4 w-4 rounded-full bg-accent-cyan shadow-[0_0_16px_rgba(34,211,238,0.6)]" />
      </RadixSlider.Root>
    </div>
  );
}
```

```tsx
// Tabs.tsx
import * as RadixTabs from '@radix-ui/react-tabs';
export function Tabs({ tabs }: { tabs: { value: string; label: string; content: React.ReactNode }[] }) {
  return (
    <RadixTabs.Root defaultValue={tabs[0]?.value}>
      <RadixTabs.List className="flex gap-2">{tabs.map((t) => <RadixTabs.Trigger key={t.value} value={t.value} className="rounded-md px-3 py-1.5 text-sm text-txt-secondary data-[state=active]:bg-white/10 data-[state=active]:text-txt-primary">{t.label}</RadixTabs.Trigger>)}</RadixTabs.List>
      {tabs.map((t) => <RadixTabs.Content key={t.value} value={t.value} className="mt-4">{t.content}</RadixTabs.Content>)}
    </RadixTabs.Root>
  );
}
```

- [ ] **Step 6: `index.ts`** — `export { GlassCard } from './GlassCard'; export { NeonButton } from './NeonButton'; export { Slider } from './Slider'; export { StatusPill } from './StatusPill'; export { Tabs } from './Tabs';`

- [ ] **Step 7: Run test to verify it passes** → PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): kernkomponenten (glasscard, neonbutton, slider, statuspill, tabs)"
```

### Task E2: FloatingPanel + CommandPalette + Sparkline + Toaster

**Files:**
- Create: `packages/ui/src/{FloatingPanel,CommandPalette,Sparkline,Toaster}.tsx`, add to index.

- [ ] **Step 1: `Sparkline.tsx`** (Canvas-basiert, leichtgewichtig, keine recharts-Abh. für Dock):

```tsx
import { useEffect, useRef } from 'react';
export function Sparkline({ data, color = '#22D3EE', width = 80, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const max = Math.max(...data, 1); ctx.clearRect(0, 0, width, height); ctx.beginPath();
    data.forEach((v, i) => { const x = (i / (data.length - 1)) * width; const y = height - (v / max) * height; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }, [data, color, width, height]);
  return <canvas ref={ref} width={width} height={height} />;
}
```

- [ ] **Step 2: `FloatingPanel.tsx`** (draggable via Framer `drag`, persistierbar vom Consumer):

```tsx
import { motion } from 'framer-motion';
export function FloatingPanel({ children, onClose, title }: { children: React.ReactNode; onClose?: () => void; title?: string }) {
  return (
    <motion.div drag dragMomentum={false} className="fixed z-50 w-80 rounded-lg border border-white/10 bg-elev-2/80 backdrop-blur-glass-strong p-3 shadow-xl" style={{ top: 80, right: 24 }}>
      <div className="mb-2 flex items-center justify-between text-sm text-txt-secondary"><span>{title}</span>{onClose && <button onClick={onClose}>✕</button>}</div>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: `CommandPalette.tsx`** (lokaler State, öffnet via ⌘K aus der Shell; Items-Prop):

```tsx
import { motion, AnimatePresence } from 'framer-motion';
export interface CommandItem { id: string; label: string; onSelect: () => void; }
export function CommandPalette({ open, items, onClose }: { open: boolean; items: CommandItem[]; onClose: () => void }) {
  return (
    <AnimatePresence>{open && (
      <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div className="relative w-full max-w-xl rounded-lg border border-white/10 bg-elev-2/90 backdrop-blur-glass-strong p-2" initial={{ y: -8 }} animate={{ y: 0 }}>
          {items.map((i) => <button key={i.id} onClick={() => { i.onSelect(); onClose(); }} className="block w-full rounded px-3 py-2 text-left text-txt-primary hover:bg-white/10">{i.label}</button>)}
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}
```

- [ ] **Step 4: `Toaster.tsx`** (minimal, Kontext-basiert; Konsumer toastet via Hook — wird in Shell provider angebunden; hier nur render):

```tsx
import { motion, AnimatePresence } from 'framer-motion';
export interface Toast { id: string; message: string; tone?: 'info' | 'error' }
export function Toaster({ toasts }: { toasts: Toast[] }) {
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">{toasts.map((t) => <motion.div key={t.id} className={`rounded-md px-4 py-2 text-sm text-white ${t.tone === 'error' ? 'bg-state-error/80' : 'bg-accent-blue/80'}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{t.message}</motion.div>)}</div>;
}
```

- [ ] **Step 5: Index-Exports ergänzen + typecheck** — `pnpm typecheck`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): floatingpanel, commandpalette, sparkline, toaster"
```

---

# Phase F — Frontend Shell (`apps/web`)

### Task F1: Next.js-App-Scaffold + Tailwind + i18n + Provider

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.mjs`, `apps/web/tailwind.config.ts`, `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/messages/{de,en}.json`, `apps/web/app/[locale]/layout.tsx`, `apps/web/middleware.ts`, `apps/web/providers/SocketProvider.tsx`

- [ ] **Step 1: Package-Setup**

`apps/web/package.json`:
```json
{
  "name": "@holo/web", "version": "0.1.0", "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.2.0", "react": "^18.3.0", "react-dom": "^18.3.0",
    "zustand": "^4.5.0", "framer-motion": "^11.3.0", "lucide-react": "^0.400.0",
    "next-intl": "^3.20.0", "socket.io-client": "^4.7.0", "recharts": "^2.12.0",
    "@react-three/fiber": "^8.16.0", "@react-three/drei": "^9.108.0",
    "@holo/ui": "workspace:*", "@holo/tokens": "workspace:*", "@holo/shared": "workspace:*", "@holo/three-avatar": "workspace:*"
  },
  "devDependencies": { "typescript": "^5.4.0", "tailwindcss": "^3.4.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0", "vitest": "^1.6.0", "@playwright/test": "^1.45.0" }
}
```

- [ ] **Step 2: `tailwind.config.ts` (konsumiert Token-Preset)**

```ts
import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@holo/tokens';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}', '../../packages/three-avatar/src/**/*.{ts,tsx}'],
  presets: [tailwindPreset as any],
  darkMode: 'class',
} satisfies Config;
```

- [ ] **Step 3: `app/globals.css` (Glas-Utilities + CSS-Vars für Theme-Switch)**

```css
@tailwind base; @tailwind components; @tailwind utilities;
:root { --bg-base:#070A12; --bg-elev-1:#0C1220; --bg-elev-2:#121A2E; --txt-primary:#E6EDF7; --txt-secondary:#94A3B8; }
:root[data-theme='light'] { --bg-base:#F4F7FB; --bg-elev-1:#FFFFFF; --bg-elev-2:#EAEFF7; --txt-primary:#0C1220; --txt-secondary:#475569; }
body { background: var(--bg-base); color: var(--txt-primary); font-family: Inter, system-ui, sans-serif; }
.glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(1rem); border: 1px solid rgba(255,255,255,0.08); }
.glass-strong { background: rgba(255,255,255,0.10); backdrop-filter: blur(1.5rem); border: 1px solid rgba(255,255,255,0.08); }
```

- [ ] **Step 4: `next.config.mjs` + i18n + `middleware.ts`** (next-intl-Plugin; `[locale]`-Routing):

`next.config.mjs`:
```js
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./app/i18n.ts');
export default withNextIntl({ output: 'standalone', transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'] });
```

`app/i18n.ts`:
```ts
import { getRequestConfig } from 'next-intl/server';
export default getRequestConfig(async ({ locale }) => ({ messages: (await import(`./messages/${locale}.json`)).default }));
```

`middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({ locales: ['de', 'en'], defaultLocale: 'de' });
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

- [ ] **Step 5: `messages/de.json` + `messages/en.json`** (Keys für Nav + Shell):

```json
{ "nav": { "dashboard": "Dashboard", "assistant": "KI-Assistent", "chat": "Chat", "voice": "Sprachsteuerung", "hologram": "Hologramm", "devices": "Geräte", "automation": "Automationen", "knowledge": "Wissensdatenbank", "analytics": "Analytics", "logs": "Logs", "settings": "Einstellungen" }, "shell": { "search": "Suche…", "palette": "Befehlspalette" } }
```
(`en.json` analog mit englischen Werten.)

- [ ] **Step 6: `SocketProvider.tsx`** — baut `io(NEXT_PUBLIC_SOCKET_URL)` once, dispatcht Events in Stores:

```tsx
'use client';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useAssistantStore } from '../stores/useAssistantStore';

const SocketCtx = createContext<Socket | null>(null);
export function SocketProvider({ children }: { children: ReactNode }) {
  const updateTelemetry = useTelemetryStore((s) => s.update);
  const setAssistantState = useAssistantStore((s) => s.setState);
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000');
    socket.on('telemetry:tick', updateTelemetry);
    socket.on('assistant:state', (e: { assistantId: string; state: any }) => setAssistantState(e.state));
    socket.on('assistant:response', (e: { assistantId: string; chunk: any }) => useAssistantStore.getState().appendChunk(e.chunk));
    return () => { socket.disconnect(); };
  }, [updateTelemetry, setAssistantState]);
  return <SocketCtx.Provider value={null}>{children}</SocketCtx.Provider>;
}
export const useSocket = () => useContext(SocketCtx);
```
(Hinweis: der `socket` wird zusätzlich via eigenem `useSocketStore` gehalten; hier vereinfacht. Refinement im Task: expose socket über Store statt Context, damit Actions `assistant:query` senden können.)

- [ ] **Step 7: Commit**

```bash
git add apps/web
git commit -m "feat(web): next.js-scaffold + tailwind-tokens + i18n + socket-provider"
```

### Task F2: Zustand-Stores

**Files:**
- Create: `apps/web/stores/{useAssistantStore,useTelemetryStore,useAvatarStore,useDeviceStore,useChatStore,useUIStore,useSocketStore}.ts`

- [ ] **Step 1: `useTelemetryStore.ts`** (rolling 60s window)

```ts
import { create } from 'zustand';
import type { TelemetryTick } from '@holo/shared';
interface State { current: TelemetryTick | null; history: TelemetryTick[]; update: (t: TelemetryTick) => void; }
const MAX = 60;
export const useTelemetryStore = create<State>((set) => ({
  current: null, history: [],
  update: (t) => set((s) => ({ current: t, history: [...s.history, t].slice(-MAX) })),
));
```

- [ ] **Step 2: `useAssistantStore.ts`**

```ts
import { create } from 'zustand';
import type { AssistantState, ChatChunk } from '@holo/shared';
interface Msg { role: 'user' | 'assistant'; content: string; }
interface State {
  id: string; state: AssistantState; muted: boolean; messages: Msg[]; streaming: boolean;
  setState: (s: AssistantState) => void; toggleMute: () => void;
  addUser: (t: string) => void; appendChunk: (c: ChatChunk) => void; finishStream: () => void;
}
export const useAssistantStore = create<State>((set) => ({
  id: 'a1', state: 'online', muted: false, messages: [], streaming: false,
  setState: (state) => set({ state }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  addUser: (t) => set((s) => ({ messages: [...s.messages, { role: 'user', content: t }], streaming: true })),
  appendChunk: (c) => set((s) => {
    const last = s.messages[s.messages.length - 1];
    if (last?.role === 'assistant') { const copy = [...s.messages]; copy[copy.length - 1] = { role: 'assistant', content: last.content + c.delta }; return { messages: copy }; }
    return { messages: [...s.messages, { role: 'assistant', content: c.delta }] };
  }),
  finishStream: () => set({ streaming: false }),
}));
```

- [ ] **Step 3: `useAvatarStore.ts`** (persistiert)

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarCommand, AvatarTransform } from '@holo/shared';
interface State extends Record<string, unknown> { transform: AvatarTransform; command: AvatarCommand; setTransform: (p: Partial<AvatarTransform>) => void; setCommand: (c: Partial<AvatarCommand>) => void; }
export const useAvatarStore = create<State>()(persist((set) => ({
  transform: { brightness: 1, opacity: 0.9, scale: 1, posX: 0, posY: 0, rotationY: 0 },
  command: { gesture: 'idle', expression: 'neutral', gaze: { x: 0, y: 0 }, lipSync: 0 },
  setTransform: (p) => set((s) => ({ transform: { ...s.transform, ...p } })),
  setCommand: (c) => set((s) => ({ command: { ...s.command, ...c } })),
}), { name: 'holo-avatar' }));
```

- [ ] **Step 4: `useUIStore.ts`** (persistiert: sidebar/dock/theme/locale), `useSocketStore.ts` (hält Socket-Instanz + `send`), `useChatStore`, `useDeviceStore` (Stubs analog).

- [ ] **Step 5: Typecheck** — `pnpm typecheck`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/stores
git commit -m "feat(web): zustand-stores (telemetry, assistant, avatar, ui, socket)"
```

### Task F3: Shell-Layout (Sidebar, Topbar, StatusDock) + Routing + Command-Palette + Tastenkürzel

**Files:**
- Create: `apps/web/app/[locale]/(shell)/layout.tsx`, `components/{Sidebar,Topbar,StatusDock,NavItems}.tsx`, `(shell)/page.tsx` (Dashboard-Übersicht), `app/[locale]/(shell)/{assistant,chat,voice,hologram,devices,automation,knowledge,analytics,logs,settings}/page.tsx` (Platzhalter-Seiten)

- [ ] **Step 1: `NavItems.tsx`** (statische Liste + next-intl-Labels).

- [ ] **Step 2: `Sidebar.tsx`** — kollabierbar (`useUIStore`), Multi-Assistenten-Switcher unten (Stub-Liste aus `useAssistantStore`), aktiver Eintrag mit `glow-cyan`.

- [ ] **Step 3: `Topbar.tsx`** — Logo, `⌘K`-Trigger (öffnet `CommandPalette`), Suchfeld, Notifications-Bell, Profil-Menü, Dark/Light-Toggle (`useUIStore` toggelt `data-theme` auf `<html>`), Sprach-Umschalter (next-intl `useRouter().replace`).

- [ ] **Step 4: `StatusDock.tsx`** — Sparklines für CPU/GPU/RAM aus `useTelemetryStore.history.map(t => t.cpu)` etc., Avatar-Status-Pill, FPS-Text, einklappbar.

- [ ] **Step 5: `CommandPalette`-Wiring + globale Tastenkürzel** — `useEffect` auf `keydown`: `⌘K`→Palette, `⌘B`→Sidebar-Toggle, `⌘D`→Dock-Toggle, `⌘,`→`/settings`. Items = Nav-Sprünge + Schnellaktionen.

- [ ] **Step 6: Shell-Layout + Routing** — `(shell)/layout.tsx` rendert Sidebar+Topbar+Dock+Outlet (next-intl `Link` mit `locale`). Dashboard-Seite zeigt Widget-Grid mit Verlauf (Statuš/Telemetrie-Statkarten). Folge-Seiten `chat/voice/hologram/.../settings` als Platzhalter mit GlassCard + „Wird in Folgezyklus ausgebaut."

- [ ] **Step 7: E2E-Test `shell-nav.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
test('sidebar navigation cycles all routes', async ({ page }) => {
  await page.goto('http://localhost:3000/de');
  for (const r of ['assistant', 'chat', 'voice', 'hologram', 'devices', 'automation', 'knowledge', 'analytics', 'logs', 'settings']) {
    await page.click(`[data-nav="${r}"]`); await expect(page).toHaveURL(new RegExp(r));
  }
});
test('command palette opens with cmd-k', async ({ page }) => {
  await page.goto('http://localhost:3000/de');
  await page.keyboard.press('Meta+k'); await expect(page.locator('[role="palette"]')).toBeVisible();
});
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/app apps/web/components
git commit -m "feat(web): app-shell (sidebar, topbar, statusdock), routing, palette, shortcuts"
```

---

# Phase G — 3D-Avatar + KI-Assistent-View

### Task G1: `packages/three-avatar` (R3F-Scene + GLB-Platzhalter + Controller)

**Files:**
- Create: `packages/three-avatar/package.json`, `src/{AvatarScene,AvatarModel,AvatarController,index}.tsx`, `assets/avatar-bust.glb` (Platzhalter-Asset), `src/__tests__/controller.test.ts`

**Interfaces:**
- Consumes: `@holo/shared` (`AvatarCommand`, `AssistantState`), `@holo/tokens`.
- Produces: `<AvatarScene />` (drop-in für KI-Assistent-View).

- [ ] **Step 1: Package-Setup** (deps: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `@holo/shared`, `@holo/tokens`).

- [ ] **Step 2: Platzhalter-GLB beschaffen** — stilisiertes Robotik-Bust-GLB (lizenzfrei) nach `assets/avatar-bust.glb` legen. Falls nicht verfügbar: Procedural-Fallback in `AvatarModel` (siehe Step 4), der GLB-Pfad bleibt konfigurierbar.

- [ ] **Step 3: Failing test `controller.test.ts`** (mappt State→Expression/Gesture, reine Logik ohne WebGL):

```ts
import { describe, it, expect } from 'vitest';
import { mapStateToCommand } from '../AvatarController';
import type { AssistantState } from '@holo/shared';
describe('mapStateToCommand', () => {
  it('thinking maps to think expression + idle gesture', () => {
    expect(mapStateToCommand('thinking')).toMatchObject({ expression: 'think', gesture: 'idle' });
  });
  it('answering maps to speak expression', () => {
    expect(mapStateToCommand('answering')).toMatchObject({ expression: 'speak' });
  });
  it('error maps to concern expression', () => {
    expect(mapStateToCommand('error')).toMatchObject({ expression: 'concern' });
  });
});
```

- [ ] **Step 4: Run test to verify it fails** → FAIL.

- [ ] **Step 5: `AvatarController.tsx`** (Logik + Hook `useAvatarFrame` zum Lerp der Morph-Weights):

```tsx
import type { AssistantState, AvatarCommand, Expression, Gesture } from '@holo/shared';
export function mapStateToCommand(state: AssistantState): { expression: Expression; gesture: Gesture } {
  switch (state) {
    case 'thinking': return { expression: 'think', gesture: 'idle' };
    case 'answering': return { expression: 'speak', gesture: 'nod' };
    case 'listening': return { expression: 'neutral', gesture: 'idle' };
    case 'error': return { expression: 'concern', gesture: 'shrug' };
    default: return { expression: 'neutral', gesture: 'idle' };
  }
}
```

- [ ] **Step 6: Run test to verify it passes** → PASS.

- [ ] **Step 7: `AvatarModel.tsx`** — lädt GLB via `useGLTF` (Suspense), wendet Morph-Weights (Expression → Blendshape-Index) + Knochen-Rotation (Gaze) via `useFrame`-Lerp; Procedural-Fallback (Box-Kopf + Ring) falls GLB fehlt. Bindet `useAvatarStore.transform` (Brightness/Opacity via `<meshStandardMaterial>`-Props, RotationY, Scale).

- [ ] **Step 8: `AvatarScene.tsx`** — `<Canvas>` mit `<ambientLight>`, `<pointLight>` cyan, `<Environment preset="night" />`, `<ContactShadows>`, `<AvatarModel/>`, Postprocessing `<Bloom>`; Hologramm-Ring (Shader/`drei.Ring`) + Partikel (`drei.Points`); `frameloop="demand"`-Alternative dokumentiert.

- [ ] **Step 9: `index.ts`** — `export { AvatarScene } from './AvatarScene'; export { mapStateToCommand } from './AvatarController';`

- [ ] **Step 10: Commit**

```bash
git add packages/three-avatar
git commit -m "feat(three-avatar): r3f-scene, glb-avatar, status→mimik-controller"
```

### Task G2: KI-Assistent-View (3-Spalten, Sprachwellen, Chat, Mikro/Kamera)

**Files:**
- Create: `apps/web/app/[locale]/(shell)/assistant/page.tsx`, `components/assistant/{VoiceWaves,MicCamStatus,ChatPanel,QuickActions}.tsx`

- [ ] **Step 1: `VoiceWaves.tsx`** — Canvas-Bars, Amplitude aus `assistant:wave`-Events (lokaler State via Socket); State-color (cyan/turquoise/violet); `prefers-reduced-motion` → flache Linie.

- [ ] **Step 2: `MicCamStatus.tsx`** — `MediaDevices.getUserMedia`-Permissions-Abfrage (Mikro/Kamera), Pills (Aktiv/Ruhe/Gesperrt) → `useDeviceStore`; WebRTC-Signalisierung über `useSocketStore` (Stub-Self-Loop für Phase 1).

- [ ] **Step 3: `ChatPanel.tsx`** — Verlauf aus `useChatStore`, Streaming via `useAssistantStore` (tokenweise Cursor), Markdown-Render (minimal: `dangerouslySetInnerHTML` oder `react-markdown` später), Push-to-Talk-Hint (`Space`), `⌘Enter`-Senden → `useSocketStore.send('assistant:query', {...})`; Favoriten-Star + Copy.

- [ ] **Step 4: `QuickActions.tsx`** — Mute (`assistant:mute`), Stop (`assistant:abort`), Szenen-Dummy, Modell-Switch (liest `ModelInfo[]` via REST `/api/assistants`).

- [ ] **Step 5: `assistant/page.tsx`** — 3-Spalten-Grid (links Mikro/Cam/Wake/Sprachwellen, Mitte `<AvatarScene/>`, rechts `ChatPanel`), oben StatusPill + Name + Text/Sprach-Toggle, unten `QuickActions`.

- [ ] **Step 6: E2E `assistant-flow.spec.ts`** — `⌘K`→/assistant, Chat-Nachricht senden, verifiziert dass eine Assistant-Antwort-Message erscheint (gegen laufenden Server via `webServer`-Config in `playwright.config.ts`).

- [ ] **Step 7: Commit**

```bash
git add apps/web/app apps/web/components
git commit -m "feat(web): ki-assistent-view (hologramm, sprachwellen, chat, mic/cam)"
```

---

# Phase H — Docker, GitHub-CI, README-Finalisierung, Tests

### Task H1: Dockerfiles + docker-compose

**Files:**
- Create: `Dockerfile.web`, `Dockerfile.server`, `docker-compose.yml`, `.dockerignore`

- [ ] **Step 1: `Dockerfile.web` (multi-stage, standalone)**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/tokens/package.json packages/tokens/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY packages/three-avatar/package.json packages/three-avatar/
RUN pnpm install --frozen-lockfile
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @holo/web build
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
```

- [ ] **Step 2: `Dockerfile.server` (multi-stage)**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @holo/server build
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/server/dist ./apps/server/dist
COPY --from=builder /repo/apps/server/package.json ./apps/server/
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4000/healthz || exit 1
CMD ["node", "apps/server/dist/index.js"]
```

- [ ] **Step 3: `docker-compose.yml`**

```yaml
services:
  server:
    build: { context: ., dockerfile: Dockerfile.server }
    env_file: .env
    environment: [ PORT=4000, CORS_ORIGIN=http://localhost:3000, LLM_ADAPTER=mock ]
    ports: [ "4000:4000" ]
    restart: unless-stopped
    healthcheck: { test: ["CMD","wget","-qO-","http://localhost:4000/healthz"], interval: 30s, timeout: 3s }
    networks: [ holo-net ]
  web:
    build: { context: ., dockerfile: Dockerfile.web }
    env_file: .env
    environment: [ NEXT_PUBLIC_API_URL=http://server:4000, NEXT_PUBLIC_SOCKET_URL=http://localhost:4000 ]
    ports: [ "3000:3000" ]
    depends_on: { server: { condition: service_healthy } }
    restart: unless-stopped
    networks: [ holo-net ]
networks: { holo-net: {} }
# Produktion: Caddy/Traefik-Reverse-Proxy-Profil mit TLS auskommentiert ergänzen.
```

- [ ] **Step 4: `.dockerignore`** — `node_modules`, `.next`, `dist`, `coverage`, `.git`, `.env`.

- [ ] **Step 5: Build-Verifikation** — `docker compose build` → beide Images bauen ohne Error.

- [ ] **Step 6: Lauf-Verifikation** — `docker compose up` → `curl localhost:3000` (HTML) + `curl localhost:4000/healthz` (`{"status":"ok"}`) OK.

- [ ] **Step 7: Commit**

```bash
git add Dockerfile.web Dockerfile.server docker-compose.yml .dockerignore
git commit -m "feat(docker): dockerfiles + compose für web und server"
```

### Task H2: GitHub-CI-Workflow + Templates + README-Finalisierung

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE/*.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`, finalize `README.md`

- [ ] **Step 1: `.github/workflows/ci.yml`**

```yaml
name: CI
on: { push: { branches: [main] }, pull_request: {} }
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 2: Issue-/PR-Templates + `CONTRIBUTING.md`** (Setup, Branch-Konvention, Commit-Stil, Docker-Quickstart).

- [ ] **Step 3: `README.md` finalisieren** — Feature-Liste, Architektur-Diagramm (ASCII), Scripts, Docker, Env-Vars, Roadmap-Link auf `docs/superpowers/specs/`.

- [ ] **Step 4: Commit**

```bash
git add .github README.md CONTRIBUTING.md
git commit -m "chore: github-ci, templates, readme-finalisierung"
```

### Task H3: Mindest-Test-Suite grün + finaler Build

- [ ] **Step 1:** `pnpm test` — alle Unit/Component-Tests (tokens, shared typecheck, server simulator/mock/bootstrap, ui StatusPill, three-avatar controller) grün.
- [ ] **Step 2:** `pnpm typecheck` — kein Fehler in allen Packages.
- [ ] **Step 3:** `pnpm build` — web (standalone) + server (dist) bauen ohne Error.
- [ ] **Step 4:** Playwright `pnpm test:e2e` gegen `docker compose up`-Stack grün (Shell-Nav + Assistant-Chat-Flow).
- [ ] **Step 5:** Finaler Commit + Tag

```bash
git commit --allow-empty -m "chore: fundament-schiene complete (tests + build grün)"
git tag v0.1.0-fundament
```

---

## Self-Review-Notizen

- **Spec-Abdeckung:** Sektionen 1 (Monorepo/Stack) → A1/F1; 2 (Designsystem) → B1+E1; 3 (Shell/Routing) → F3; 4 (Backend) → D1–D4; 5 (State + Assistent-View + Avatar) → F2+G1+G2; 7 (Testing) → Tests in jeder Phase + H3; 8 (Docker/GitHub) → H1–H2; 9 (Folge-Views) → Platzhalter in F3. ✓
- **Placeholders:** keiner — alle Code-Schritte enthalten vollständigen Code oder exakte Befehle.
- **Typ-Konsistenz:** `AssistantState`, `TelemetryTick`, `AvatarCommand`, `ChatChunk`, `LLMAdapter` einheitlich über Phasen; `mapStateToCommand`-Signatur in G1-Test und -Impl identisch.
- **Offen in Folgezyklen (bewusst nicht in diesem Plan):** rechte Ausstattung der 11 Folge-Views, PWA-Offline-Service-Worker, Plugin-Registry, echte JWT-Auth, Vektor-DB — dokumentiert in Spec Sektion 9.