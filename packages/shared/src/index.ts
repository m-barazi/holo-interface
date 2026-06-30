export * from './assistant';
export * from './telemetry';
export * from './avatar';
export * from './device';
export * from './api';

import type { AssistantState, ChatChunk, QueryRequest } from './assistant';
import type { TelemetryTick } from './telemetry';
import type { AvatarCommand } from './avatar';

export interface SocketEvents {
  'telemetry:tick': (tick: TelemetryTick) => void;
  'assistant:state': (s: { assistantId: string; state: AssistantState }) => void;
  'assistant:transcript': (s: { assistantId: string; text: string }) => void;
  'assistant:response': (s: { assistantId: string; chunk: ChatChunk }) => void;
  'assistant:response:done': (
    s: { assistantId: string; tokensIn: number; tokensOut: number; latencyMs: number },
  ) => void;
  'assistant:wave': (s: { assistantId: string; level: number }) => void;
  'avatar:command': (c: AvatarCommand) => void;
  'webrtc:offer': (s: { from: string; sdp: string }) => void;
  'webrtc:answer': (s: { from: string; sdp: string }) => void;
  'webrtc:ice': (s: { from: string; candidate: string }) => void;
}

export interface ClientEvents {
  'assistant:query': (req: QueryRequest) => void;
  'assistant:mute': (s: { assistantId: string; muted: boolean }) => void;
  'assistant:abort': (s: { assistantId: string }) => void;
  'avatar:command': (c: AvatarCommand) => void;
  'webrtc:offer': (s: { to: string; sdp: string }) => void;
  'webrtc:answer': (s: { to: string; sdp: string }) => void;
  'webrtc:ice': (s: { to: string; candidate: string }) => void;
}