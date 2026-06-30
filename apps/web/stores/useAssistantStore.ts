import { create } from 'zustand';
import type { AssistantState, ChatChunk } from '@holo/shared';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantStateStore {
  id: string;
  name: string;
  state: AssistantState;
  muted: boolean;
  messages: Msg[];
  streaming: boolean;
  waveLevel: number;
  setState: (s: AssistantState) => void;
  setWave: (level: number) => void;
  toggleMute: () => void;
  setMuted: (v: boolean) => void;
  addUser: (t: string) => void;
  appendChunk: (c: ChatChunk) => void;
  finishStream: () => void;
  reset: () => void;
}

export const useAssistantStore = create<AssistantStateStore>((set) => ({
  id: 'a1',
  name: 'Nova',
  state: 'online',
  muted: false,
  messages: [],
  streaming: false,
  waveLevel: 0,
  setState: (state) => set({ state }),
  setWave: (waveLevel) => set({ waveLevel }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setMuted: (muted) => set({ muted }),
  addUser: (t) =>
    set((s) => ({
      messages: [...s.messages, { role: 'user', content: t }],
      streaming: true,
    })),
  appendChunk: (c) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (last?.role === 'assistant') {
        const copy = [...s.messages];
        copy[copy.length - 1] = { role: 'assistant', content: last.content + c.delta };
        return { messages: copy };
      }
      return { messages: [...s.messages, { role: 'assistant', content: c.delta }] };
    }),
  finishStream: () => set({ streaming: false, waveLevel: 0 }),
  reset: () => set({ messages: [], streaming: false }),
}));