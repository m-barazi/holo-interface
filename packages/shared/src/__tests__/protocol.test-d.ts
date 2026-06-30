import { describe, it, expectTypeOf } from 'vitest';
import type { SocketEvents, TelemetryTick } from '../index';

describe('protocol type consistency', () => {
  it('telemetry:tick payload matches TelemetryTick', () => {
    expectTypeOf<Parameters<SocketEvents['telemetry:tick']>[0]>().toMatchTypeOf<TelemetryTick>();
  });
});