import { create } from 'zustand';
import type { TelemetryTick } from '@holo/shared';

const MAX = 60;

interface TelemetryState {
  current: TelemetryTick | null;
  history: TelemetryTick[];
  connected: boolean;
  update: (t: TelemetryTick) => void;
  setConnected: (v: boolean) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  current: null,
  history: [],
  connected: false,
  update: (t) =>
    set((s) => ({ current: t, history: [...s.history, t].slice(-MAX) })),
  setConnected: (v) => set({ connected: v }),
}));