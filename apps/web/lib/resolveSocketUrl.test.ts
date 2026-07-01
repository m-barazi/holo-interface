import { describe, it, expect } from 'vitest';
import { resolveSocketUrl } from './resolveSocketUrl';

const prodLoc = { hostname: 'holo.barazi.cloud', origin: 'https://holo.barazi.cloud' };
const localLoc = { hostname: 'localhost', origin: 'http://localhost:3000' };

describe('resolveSocketUrl', () => {
  it('nutzt die env-URL unverändert im lokalen Dev (hostname localhost)', () => {
    expect(resolveSocketUrl('http://localhost:4000', localLoc)).toBe('http://localhost:4000');
  });

  it('fällt im lokalen Dev ohne env auf den Dev-Default http://localhost:4000 zurück', () => {
    expect(resolveSocketUrl(undefined, localLoc)).toBe('http://localhost:4000');
  });

  it('nutzt die env-URL in Prod, wenn sie nicht auf localhost zeigt', () => {
    expect(resolveSocketUrl('https://holo-api.barazi.cloud', prodLoc)).toBe(
      'https://holo-api.barazi.cloud',
    );
  });

  it('fällt in Prod auf same-origin zurück, wenn die env-URL fälschlich localhost ist (fehlerhafter Build)', () => {
    // Der VPS-Bug: NEXT_PUBLIC_SOCKET_URL=http://localhost:4000 landet fix im Bundle.
    // Same-origin (mit Reverse-Proxy /socket.io) ist der bessere Fallback als ws://localhost:4000.
    expect(resolveSocketUrl('http://localhost:4000', prodLoc)).toBe('https://holo.barazi.cloud');
  });

  it('fällt in Prod ohne env auf same-origin zurück', () => {
    expect(resolveSocketUrl(undefined, prodLoc)).toBe('https://holo.barazi.cloud');
  });
});