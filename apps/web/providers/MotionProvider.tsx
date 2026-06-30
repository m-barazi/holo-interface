'use client';

import { LazyMotion, domMax } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Lagert den Framer-Motion-Feature-Bundle in einen separaten,
 * lazy geladenen Chunk aus. `strict` erzwingt die Nutzung von `m.*`
 * (statt `motion.*`) im gesamten Subtree — ein vergessenes `motion.*`
 * wirft zur Laufzeit und macht so die Migration sichtbar.
 *
 * `domMax` statt `domAnimation`, weil die Sidebar ein `layoutId`
 * (Shared-Layout-Animation) nutzt, das nur im vollen Feature-Bundle
 * enthalten ist.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion strict features={domMax}>{children}</LazyMotion>;
}