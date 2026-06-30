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