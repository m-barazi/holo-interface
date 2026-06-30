import { describe, it, expect } from 'vitest';
import type { AssistantState, AvatarCommand, TelemetryTick, Device } from '../index';

describe('shared protocol shape', () => {
  it('AssistantState union has 6 members', () => {
    const states: AssistantState[] = [
      'online',
      'offline',
      'listening',
      'thinking',
      'answering',
      'error',
    ];
    expect(states).toHaveLength(6);
  });

  it('AvatarCommand fields are optional', () => {
    const cmd: AvatarCommand = { expression: 'speak' };
    expect(cmd.expression).toBe('speak');
    expect(cmd.gesture).toBeUndefined();
  });

  it('TelemetryTick has net nested object', () => {
    const tick: TelemetryTick = {
      ts: 1,
      cpu: 1,
      gpu: 1,
      ram: 1,
      net: { up: 1, down: 1, latency: 1, ping: 1, internet: true },
      temp: 1,
      energy: 1,
      fps: 1,
      apiStatus: 'ok',
    };
    expect(tick.net.internet).toBe(true);
  });

  it('Device defaults to valid kinds', () => {
    const d: Device = { id: 'd1', kind: 'projector', name: 'Holo-Proj', status: 'active', online: true };
    expect(d.kind).toBe('projector');
  });
});