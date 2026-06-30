import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { QueryRequest, AvatarCommand } from '@holo/shared';

interface SocketState {
  socket: Socket | null;
  init: (url: string) => Socket;
  send: (event: 'assistant:query', payload: QueryRequest) => void;
  emitAbort: (assistantId: string) => void;
  emitMute: (assistantId: string, muted: boolean) => void;
  emitAvatarCommand: (c: AvatarCommand) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  init: (url) => {
    const existing = get().socket;
    if (existing) return existing;
    const socket = io(url, { transports: ['websocket'] });
    set({ socket });
    return socket;
  },
  send: (event, payload) => {
    get().socket?.emit(event, payload);
  },
  emitAbort: (assistantId) => {
    get().socket?.emit('assistant:abort', { assistantId });
  },
  emitMute: (assistantId, muted) => {
    get().socket?.emit('assistant:mute', { assistantId, muted });
  },
  emitAvatarCommand: (c) => {
    get().socket?.emit('avatar:command', c);
  },
  disconnect: () => {
    const s = get().socket;
    if (s) {
      s.disconnect();
      set({ socket: null });
    }
  },
}));