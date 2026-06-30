'use client';

import { useEffect } from 'react';
import { useRouter } from '@/app/i18n/navigation';
import { useUIStore } from '@/stores/useUIStore';

export function GlobalShortcuts() {
  const router = useRouter();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleDock = useUIStore((s) => s.toggleDock);
  const togglePalette = useUIStore((s) => s.togglePalette);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'k') {
        e.preventDefault();
        togglePalette();
      } else if (key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (key === 'd') {
        e.preventDefault();
        toggleDock();
      } else if (key === ',') {
        e.preventDefault();
        router.push('/settings');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, toggleSidebar, toggleDock, togglePalette]);

  return null;
}