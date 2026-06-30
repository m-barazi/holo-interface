import type { Server as IOServer } from 'socket.io';
import { startTelemetry } from './telemetry.js';
import { attachAssistant } from './assistant.js';
import { attachWebRTC } from './webrtc.js';

export function attachSockets(io: IOServer) {
  const { getState } = attachAssistant(io);
  startTelemetry(io, getState);
  attachWebRTC(io);
}