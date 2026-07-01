/**
 * Resolve the Socket.IO endpoint URL for the browser client.
 *
 * `NEXT_PUBLIC_SOCKET_URL` is inlined at build time into the client bundle.
 * If the production image is built without the correct build-arg, the Dockerfile
 * default `http://localhost:4000` ends up baked into the bundle — which on the VPS
 * makes the client try `ws://localhost:4000` (the user's machine) and fail.
 *
 * This resolver adds a runtime defense-in-depth fallback:
 *  - Local dev (hostname localhost/127.0.0.1): trust the env URL (or the dev default).
 *  - Production with a non-localhost env URL: use it verbatim.
 *  - Production with a localhost/missing env URL: fall back to same-origin
 *    (`window.location.origin`), which works when a reverse proxy exposes
 *    `/socket.io` on the web host — strictly better than the baked-in localhost.
 */
export interface LocationLike {
  hostname: string;
  origin: string;
}

const DEV_DEFAULT = 'http://localhost:4000';

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function resolveSocketUrl(
  envUrl: string | undefined,
  loc: LocationLike = typeof window !== 'undefined'
    ? window.location
    : { hostname: 'localhost', origin: 'http://localhost:3000' },
): string {
  if (isLocalHostname(loc.hostname)) {
    return envUrl ?? DEV_DEFAULT;
  }
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return loc.origin;
}