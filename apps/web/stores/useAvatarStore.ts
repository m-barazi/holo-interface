import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarCommand, AvatarTransform } from '@holo/shared';

interface AvatarState {
  transform: AvatarTransform;
  command: AvatarCommand;
  setTransform: (p: Partial<AvatarTransform>) => void;
  setCommand: (c: Partial<AvatarCommand>) => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      transform: {
        brightness: 1,
        opacity: 0.9,
        scale: 1,
        posX: 0,
        posY: 0,
        rotationY: 0,
      },
      command: {
        gesture: 'idle',
        expression: 'neutral',
        gaze: { x: 0, y: 0 },
        lipSync: 0,
      },
      setTransform: (p) => set((s) => ({ transform: { ...s.transform, ...p } })),
      setCommand: (c) => set((s) => ({ command: { ...s.command, ...c } })),
    }),
    { name: 'holo-avatar' },
  ),
);