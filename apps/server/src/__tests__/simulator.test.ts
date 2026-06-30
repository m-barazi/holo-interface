import { describe, it, expect } from 'vitest';
import { simulateTick, baselineTick } from '../telemetry/simulator';

describe('simulateTick', () => {
  it('keeps values in plausible ranges', () => {
    const t = simulateTick(baselineTick(), 'online');
    expect(t.cpu).toBeGreaterThanOrEqual(0);
    expect(t.cpu).toBeLessThanOrEqual(100);
    expect(t.gpu).toBeGreaterThanOrEqual(0);
    expect(t.gpu).toBeLessThanOrEqual(100);
    expect(t.fps).toBeGreaterThan(0);
  });

  it('spikes GPU when thinking', () => {
    const base = baselineTick();
    const t = simulateTick(base, 'thinking');
    expect(t.gpu).toBeGreaterThan(base.gpu);
    expect(t.temp).toBeGreaterThanOrEqual(base.temp);
  });

  it('marks api degraded on error', () => {
    const t = simulateTick(baselineTick(), 'error');
    expect(t.apiStatus).toBe('degraded');
  });
});