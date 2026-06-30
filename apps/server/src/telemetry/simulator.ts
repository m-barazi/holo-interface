import type { TelemetryTick, AssistantState } from '@holo/shared';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const walk = (prev: number, vol: number, lo: number, hi: number) =>
  clamp(prev + (Math.random() - 0.5) * vol, lo, hi);

export function simulateTick(prev: TelemetryTick, state: AssistantState): TelemetryTick {
  const thinking = state === 'thinking';
  return {
    ts: Date.now(),
    cpu: walk(prev.cpu, 8, 2, thinking ? 95 : 60),
    gpu: thinking
      ? clamp(prev.gpu + 15 + Math.random() * 10, 10, 100)
      : walk(prev.gpu, 6, 5, 40),
    ram: walk(prev.ram, 3, 20, 90),
    net: {
      up: walk(prev.net.up, 30, 10, 2000),
      down: walk(prev.net.down, 60, 100, 5000),
      latency: walk(prev.net.latency, 2, 1, 80),
      ping: walk(prev.net.ping, 2, 2, 100),
      internet: true,
    },
    temp: thinking
      ? clamp(prev.temp + 2 + Math.random() * 3, 35, 85)
      : walk(prev.temp, 1, 35, 65),
    energy: walk(prev.energy, 4, 40, 200),
    fps: Math.round(walk(prev.fps, 2, 30, 120)),
    apiStatus: state === 'error' ? 'degraded' : 'ok',
  };
}

export function baselineTick(): TelemetryTick {
  return {
    ts: 0,
    cpu: 20,
    gpu: 10,
    ram: 30,
    net: { up: 100, down: 500, latency: 5, ping: 10, internet: true },
    temp: 45,
    energy: 80,
    fps: 60,
    apiStatus: 'ok',
  };
}