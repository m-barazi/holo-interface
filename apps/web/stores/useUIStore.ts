import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface UIState {
  sidebarCollapsed: boolean;
  dockVisible: boolean;
  paletteOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  toggleDock: () => void;
  setPalette: (v: boolean) => void;
  togglePalette: () => void;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      dockVisible: true,
      paletteOpen: false,
      theme: 'dark',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleDock: () => set((s) => ({ dockVisible: !s.dockVisible })),
      setPalette: (v) => set({ paletteOpen: v }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'holo-ui',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        dockVisible: s.dockVisible,
        theme: s.theme,
      }),
    },
  ),
);