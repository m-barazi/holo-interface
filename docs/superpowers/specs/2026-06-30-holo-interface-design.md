# Holo-Interface — Design-Spec

**Datum:** 2026-06-30
**Status:** Freigegeben (Sektionen 1–6 vom User approved)
**Ziel:** Futuristisches, glas-morphisches Web-Interface als Steuerzentrale für einen holografischen KI-Assistenten. Vollsystem inkl. Backend, GitHub-ready, Docker-ready.

## 1. Entscheidungen (Brainstorming-Ergebnis)

- **Scope:** Vollsystem inkl. Backend (Frontend + Node/Socket.IO-Server + WebRTC-Signalisierung + Telemetrie-Simulation + LLM-Adapter).
- **Architektur:** Monorepo — `apps/web` (Next.js) + `apps/server` (Node/Express/Socket.IO) + shared Packages.
- **Hologramm:** 3D-Avatar-Modell (GLB) mit Blendshapes/Mimik/Gesten via React Three Fiber.
- **Phasing:** Ansatz A — Vertikale Fundament-Schiene: erst Monorepo + Designsystem + Shell + Backend + KI-Assistent-View komplett durch, danach Folge-Views modular.
- **Deployment:** Docker (Dockerfiles + docker-compose.yml), GitHub (CI-Workflow, README, Templates).

## 2. Monorepo & Tech-Stack

```
holo-interface/
├─ apps/
│  ├─ web/                 Next.js 14 (App Router, TS strict, Tailwind) — Frontend
│  └─ server/              Node 20 + Express + Socket.IO — Echtzeit-Backend
├─ packages/
│  ├─ ui/                  Designsystem (shadcn/ui-Basis + @radix primitives)
│  ├─ tokens/              Design-Tokens (Tailwind-Config + CSS-Vars + JS)
│  ├─ shared/              Typen & Protokoll (Socket-Events, Enums, API-Contracts) — web & server
│  └─ three-avatar/        R3F-Avatar (GLB-Loader, Morph-Targets, Gesten-States) + assets/
├─ turbo.json
├─ pnpm-workspace.yaml
├─ package.json
└─ tsconfig.base.json
```

**Frontend:** Next.js App Router, React 18, TypeScript strict, Tailwind CSS, Framer Motion, Zustand, React Three Fiber + drei, recharts, lucide-react, next-intl, next-pwa.
**Backend:** Node 20, Express, Socket.IO, WebRTC-Signalisierung, Web-Speech-API-Proxy, LLM-Adapter (Mock jetzt, OpenAI/Anthropic/Ollama später).
**Dev:** Turborepo, ESLint, Prettier, Vitest (Unit/Component), Playwright (E2E), Storybook.
**WebGPU:** optionaler Renderer-Pfad hinter Feature-Flag, Fallback WebGL2.

## 3. Designsystem (`packages/tokens` + `packages/ui`)

**Token-Dateien:** `color.ts`, `spacing.ts`, `radius.ts`, `motion.ts`, `glass.ts`, `typography.ts`. Export als Tailwind-Config + CSS-Vars + JS-Objekt (Single Source of Truth).

**Farbpalette (Dunkel-Theme):**
- Hintergründe gestaffelt: `bg-base #070A12`, `bg-elev-1 #0C1220`, `bg-elev-2 #121A2E`.
- Glas-Surfaces: `rgba(255,255,255,0.04–0.08)` + `backdrop-blur 16–24px` + 1px Border `rgba(255,255,255,0.08)` + inset-Schatten.
- Neon-Akzente: `cyan #22D3EE` (primär), `turquoise #2DD4BF` (Erfolg/Online), `blue #3B82F6` (Sekundär/Info), `violet #A855F7` (Denken/Daten).
- Zustands-Map: Online→turquoise, Denken→violet, Antworten→cyan, Fehler→`rose #FB7185`, Offline→`slate #64748B`.
- Text: `#E6EDF7` primär, `#94A3B8` sekundär, `#64748B` muted (AA+ auf Glas).
- Hell-Modus: eigener Token-Set via `data-theme`, Akzente unverändert.

**Typografie:** `Inter` (UI/Display, `cv02,cv03,ss01`), `JetBrains Mono` (Logs/Terminal/Metriken). Skala (rem): xs .75 / sm .875 / base .9375 / lg 1.125 / xl 1.375 / 2xl 1.75 / 3xl 2.25 / display 3.5. Heading 600, Body 400, Mono 500.

**Glasmorphismus-Klassen:** `.glass` (Standard-Surface), `.glass-strong` (Dialoge/Modals, Alpha .10), `.glass-hover` (Border→Akzent + Lift). Neon-Glow `.glow-cyan`/`.glow-violet` sparsam auf aktiven/fokussierten Elementen.

**Motion (Framer Motion):** Page-Transition `opacity + y:8` 200ms `soft`; Card-Eintritt Stagger 40ms `spring 220/26`; Status-Wechsel Crossfade 320ms `emphasized` + Skalen-Puls; Live-Werte interpoliert (Count-up, kein harter Sprung); `prefers-reduced-motion` → Instant-Wechsel.

**Icons:** `lucide-react`, 1px-stroke, Color-Binding an State-Map, tree-shaken Subset (kein Icon-Font).

## 4. App-Shell, Navigation & Routing

**Layout:** Top-Bar (h64, glass) + Sidebar (w72↔w64 kollabierbar) + Main-Outlet + Status-Dock (h40, persistente Mini-Telemetrie + Avatar-Status-Pill).

- **Sidebar:** Navi + **Multi-Assistenten-Switcher** unten (mehrere gleichzeitige KI-Assistenten, Umschalten + "Neuer Assistent").
- **Top-Bar:** Command-Palette `⌘K`, Suchfeld, Schnellaktionen (Mikro toggeln, mute, Szene), Notifications-Bell (Badge), Profil-Menü, Dark/Light-Toggle, Sprach-Umschalter.
- **Status-Dock:** CPU/GPU/RAM Sparkline + Avatar-Status-Pill + Netzwerk + FPS; einklappbar; Mobile → schwebende FAB.
- **Responsive:** Sidebar → Off-Canvas-Drawer (Mobile), Top-Bar reduziert, Widget-Grid einspaltig.

**Routing (`apps/web/app`):** Route-Group `(shell)/` mit `layout.tsx` (Shell + Outlet) und Pages: `page` (Dashboard), `assistant`, `chat`, `voice`, `hologram`, `devices`, `automation`, `knowledge`, `analytics`, `logs`, `settings`.

**Sidebar-Reihenfolge:** Dashboard · KI-Assistent · Chat · Sprachsteuerung · Hologramm · Geräte · Automationen · Wissensdatenbank · Analytics · Logs · Einstellungen.

**Drag-&-Drop/Docking:** `@dnd-kit/core` (sortable + drag zwischen Zonen); dockbare Floating-Panels (`packages/ui` `FloatingPanel`), Position/Größe in Zustand-Persist (localStorage); Layout pro Assistent speicherbar.

**Tastenkürzel:** `⌘K` Palette · `⌘B` Sidebar · `Space` Push-to-Talk · `⌘,` Settings · `⌘/` Shortcuts-Help · `⌘D` Dock-Toggle.

**i18n:** next-intl, `[locale]`-Routing (de/en), Messages via IDs, Intl für Datum/Zahlen.

## 5. Backend (`apps/server`)

```
server/src/
├─ index.ts                 Express + Socket.IO bootstrap, CORS
├─ sockets/                 telemetry.ts, assistant.ts, webrtc.ts, speech.ts
├─ llm/                     adapter.ts (Schnittstelle), mock.ts, openai.ts (später), ollama.ts (später)
├─ telemetry/simulator.ts   Pseudo-realistische Kurven (Random-Walk + Saisonalität + Last-Spikes)
├─ rest/                    assistants.ts, knowledge.ts, automation.ts, settings.ts, logs.ts, analytics.ts
├─ store/                   In-Memory (später DB/Vector-DB)
└─ shared/                  importiert packages/shared
```

**Echtzeit-Protokoll (`packages/shared`, typsicher):**
- `telemetry:tick` (1 Hz) → `{ cpu, gpu, ram, net:{up,down,latency,ping}, internet, temp, energy, fps, apiStatus }`. Status `thinking` → GPU/Temp-Spike in Simulation.
- Assistant-States: `online | offline | listening | thinking | answering | error`. Events: `assistant:state`, `assistant:transcript`, `assistant:response` (Chunk), `assistant:response:done`, `assistant:wave` (Audio-Pegel). Client: `assistant:query`, `assistant:mute`, `assistant:abort`.
- Avatar-Events: `avatar:gesture`, `avatar:expression`, `avatar:gaze`, `avatar:idle` — vom Status abgeleitet (Denken → Blick oben + Squint; Antworten → Lip-Sync-Blendshape via Audio-Pegel).
- WebRTC-Signalisierung: `webrtc:offer` / `webrtc:answer` / `webrtc:ice`. Media Peer-to-Peer (Mikro/Kamera vom Browser), Server nur Signalisierung.
- Chat-Stream: `assistant:query` → `LLMAdapter.stream()` → `assistant:response` Chunk-weise → `assistant:response:done`. Tokenverbrauch/Latenz als Metriken.

**LLM-Adapter-Schnittstelle:**
```ts
interface LLMAdapter {
  stream(req: { prompt: string; context: Context; model: ModelId;
                temperature: number; topP: number; maxTokens: number })
    : AsyncIterable<{ delta: string; tokensIn: number; tokensOut: number }>;
  models(): Promise<ModelInfo[]>; // lokal/cloud, ctx-Größe, Geschwindigkeit
}
```
Mock: deterministische, kontextsensible Antworten + realistische Token/Latenz-Metriken. Factory `createLLM('mock'|'openai'|'ollama')` — kein Frontend-Code ändert sich beim Swap.

**REST (Stub jetzt, typsicher):** `/api/assistants` (CRUD + Switch), `/api/knowledge` (Upload/Meta), `/api/automation`, `/api/settings`, `/api/logs` (paginiert), `/api/analytics` (aggregiert). Returns aus `packages/shared`.

**Fehlerbehandlung:** Socket-Reconnect exponentiell Backoff, Verbindungs-State im Status-Dock; `error`-Assistent-State bei Adapter-Ausfall → Toast + Avatar-Fehler-State; REST zentrale Fehler-Middleware mit typisierten `ApiError`-Codes.

**Sicherheit:** API-Keys nur serverseitig (Client erhält Maskierung); später JWT-Auth + Rollen/Berechtigungen (erst Struktur, dann real).

## 6. State-Management & KI-Assistent-View

**Zustand-Slices (`apps/web/stores`):** `useAssistantStore` (aktiver Assistent, status, transcript, response-stream, mute), `useTelemetryStore` (rolling-window 60s, verbindungs-state), `useAvatarStore` (gesture/expression/gaze/idle, helligkeit/transparenz/größe/rotation/position), `useDeviceStore`, `useChatStore`, `useUIStore` (sidebar/dock/theme/sprache/widgets — persistiert), `useAutomationStore`, `useKnowledgeStore`. Persistenz: `useUIStore` + `useAvatarStore` via `zustand/middleware` persist → localStorage; Telemetrie/Chat ephemeral. Zentraler `SocketProvider` verbindet once und dispatcht Events in Stores.

**KI-Assistent-View (`(shell)/assistant/page.tsx`):** 3-Spalten-Layout — links Mikro/Kamera-Status + Wake-Word + Sprachwellen, Mitte 3D-Hologramm (R3F Canvas), rechts Chat-Panel. Oben Status-Pill + Name + Text/Sprach-Toggle; unten Schnell-Aktionen (Mute · Stop · Szene · Modell-Switch).

**3D-Hologramm (`packages/three-avatar`):** R3F `<Canvas>` + drei (`Environment`, `ContactShadows`, Postprocessing `Bloom`). `useGLTF` + Morph-Targets für Mimik (Lächeln, Squint, Mund-Öffnung → Lip-Sync). Avatar-Controller mappt `useAvatarStore` + `useAssistantStore.status` → Morph-Weights, Knochen-Rotation (Gaze), Gesture-Clips; Übergänge Lerp 200ms. Idle: Atmung + Lidschlag + leichte Kopfbewegung (procedural). Hologramm-Effekte: Transparenz-Ring, Partikel-Stream, Scanlines — Parameter aus `useAvatarStore` live. Platzhalter-Avatar: stilisiertes Robotik-Bust-GLB in `packages/three-avatar/assets/`; Schnittstelle erlaubt später任意 GLB-Swap. WebGPU-Pfad hinter Flag, Fallback WebGL2.

**Sprachwellen:** Canvas/SVG-Bars, Amplitude aus `assistant:wave`; `listening` → cyan/turquoise pulsierend, `thinking` → violett, `idle` → flache Linie; `prefers-reduced-motion`.

**Mikro/Kamera-Status:** WebRTC-Peer-State + `MediaDevices.getUserMedia`-Permissions → visuelle Pills (Aktiv/Ruhe/Gesperrt) in `useDeviceStore`.

**Chat-Panel:** Verlauf aus `useChatStore`, Streaming via `assistant:response`-Chunks (tokenweise Cursor), Markdown-Render, Push-to-Talk (`Space`), `⌘Enter`-Senden, Favoriten-Star, Copy/Export.

**Status-Automat (Client-Spiegel):**
```
offline → online ──query──▶ listening ──(VAD)──▶ thinking ──(first chunk)──▶ answering ──done──▶ online
                                   └──── error ◀── (adapter/webrtc fail) ────┘
```

## 7. Testing

- **Unit (Vitest):** Token-Helper, LLM-Adapter-Mock, Telemetrie-Simulator, Avatar Status→Morph-Mapper, Store-Reducer.
- **Component (Vitest + @testing-library):** `packages/ui` (Glass-Card, Slider, Status-Pill, Tabs) — Render + A11y.
- **E2E (Playwright):** Shell-Flows: Navigation, ⌘K-Palette, Assistent-View Status-Übergänge, Chat-Stream, Dark/Light, responsive Breakpoints.
- **Socket-Integration:** Test-Client gegen Server, verifiziert `telemetry:tick` + `assistant:query → response`.
- **Storybook:** `packages/ui` + Avatar-States (online/thinking/answering/error).

## 8. Deployment — Docker & GitHub

```
holo-interface/
├─ Dockerfile.web            Next.js standalone (multi-stage, non-root), Port 3000, Healthcheck /api/health
├─ Dockerfile.server         Node-Server standalone (multi-stage, non-root), Port 4000, Healthcheck /healthz
├─ docker-compose.yml        web + server (depends_on + healthcheck), env_file, restart, holo-net
├─ .dockerignore
├─ .env.example              NEXT_PUBLIC_API_URL, SOCKET_URL, LLM_ADAPTER=mock, CORS_ORIGIN, PORT…
├─ .github/workflows/ci.yml  install → lint → typecheck → test → build (pnpm + turbo)
├─ .github/workflows/deploy.yml  (optional) build & push zu GHCR
├─ README.md                 Setup/Scripts/Docker
├─ LICENSE (MIT), CONTRIBUTING.md, .editorconfig
├─ .github/ISSUE_TEMPLATE/, .github/PULL_REQUEST_TEMPLATE.md
└─ .gitignore (node_modules, .next, .env, dist, coverage)
```

- `Dockerfile.web`: `node:20-alpine`, `pnpm install --frozen-lockfile`, `next build` (output `standalone`).
- `Dockerfile.server`: multi-stage, non-root runtime.
- `docker-compose.yml`: Services `web` (3000) + `server` (4000 intern), `depends_on` mit Healthcheck, `env_file: .env`, `restart: unless-stopped`, Netzwerk `holo-net`. Reverse-Proxy-Profil (Caddy/Traefik + TLS) auskommentiert für Produktion.

## 9. Folge-Views-Phasing (nach Fundament-Schiene, je eigener Zyklus)

1. Systemstatus (recharts + Telemetrie-Store) — 2. Sprachsteuerung — 3. Hologramm-Steuerung (Slider → `useAvatarStore`) — 4. KI-Modelle (Modell-Switch, Token/Latenz, Temperatur/Top-P) — 5. Geräte (WebRTC-Device-Liste) — 6. Automationen (Kanban) — 7. Wissensdatenbank (Upload, Suche, Vektor-DB-Stub) — 8. Chatverlauf (Suche, Favoriten, Export, Zusammenfassungen) — 9. Analytics (interaktive Charts) — 10. Logs (Live-Terminal via Socket) — 11. Einstellungen (Benutzer, Sicherheit, API-Keys, Backups, Updates, Rollen) — 12. PWA/Offline + Plugin-System-Infrastruktur.

## 10. Fundament-Schiene — Implementierungsumfang (erster Zyklus)

Der erste Implementierungsplan deckt ab: Monorepo-Setup (pnpm + turbo + tsconfig.base) → `packages/tokens` → `packages/ui` (Glass-Card, NeonButton, Slider, Tabs, Status-Pill, Chart, FloatingPanel, Command-Palette) → `packages/shared` (Protokoll-Typen) → `apps/server` (Express, Socket.IO, Telemetrie-Simulator, LLM-Adapter-Mock, Assistant-Status-Automat, WebRTC-Signalisierung, REST-Stubs, Healthchecks) → `apps/web` (App-Shell, Routing, Zustand-Stores, SocketProvider, i18n, Command-Palette, Tastenkürzel) → `packages/three-avatar` (R3F + GLB-Platzhalter + Avatar-Controller) → KI-Assistent-View (3-Spalten, Hologramm, Sprachwellen, Chat, Mikro/Kamera-Status) → Dockerfiles + docker-compose + CI + README → Tests (Unit/Component/E2E-Mindestsatz).

Folge-Views werden als geroutete Platzhalter-Seiten mit Shell-Rendering angelegt, damit Navigation sofort vollständig klickbar ist; reale Inhalts-Ausstattung erfolgt in den Folgezyklen.