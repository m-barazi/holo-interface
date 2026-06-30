import type { Server as IOServer } from 'socket.io';
import type { TelemetryTick, AssistantState } from '@holo/shared';
import { simulateTick, baselineTick } from '../telemetry/simulator.js';

export function startTelemetry(io: IOServer, getState: () => AssistantState) {
  let prev: TelemetryTick = baselineTick();
  const timer = setInterval(() => {
    prev = simulateTick(prev, getState());
    io.emit('telemetry:tick', prev);
  }, 1000);
  return timer;
}