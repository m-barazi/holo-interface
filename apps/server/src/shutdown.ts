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