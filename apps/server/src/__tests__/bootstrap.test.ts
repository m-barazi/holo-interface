import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, type RunningServer } from '../index';

let srv: RunningServer;

describe('server bootstrap', () => {
  beforeAll(async () => {
    srv = await createServer({ port: 0, corsOrigin: '*' });
  });
  afterAll(async () => {
    await srv.close();
  });

  it('responds 200 on /healthz', async () => {
    const res = await fetch(`http://localhost:${srv.port}/healthz`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  it('responds 200 on /api/health', async () => {
    const res = await fetch(`http://localhost:${srv.port}/api/health`);
    expect(res.status).toBe(200);
  });

  it('GET /api/assistants returns array with a1', async () => {
    const res = await fetch(`http://localhost:${srv.port}/api/assistants`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id: string }[];
    expect(json.some((a) => a.id === 'a1')).toBe(true);
  });

  it('GET /api/logs returns lines array', async () => {
    const res = await fetch(`http://localhost:${srv.port}/api/logs`);
    const json = (await res.json()) as { lines: string[] };
    expect(Array.isArray(json.lines)).toBe(true);
  });

  it('unknown route returns 404 with error code', async () => {
    const res = await fetch(`http://localhost:${srv.port}/api/nope`);
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('not_found');
  });
});