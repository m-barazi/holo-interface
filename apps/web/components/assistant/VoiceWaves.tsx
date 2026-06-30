'use client';

import { motion } from 'framer-motion';
import { useAssistantStore } from '@/stores/useAssistantStore';

const BARS = 28;

/** Animierter Wellen-Balken, reagiert auf waveLevel / State. */
export function VoiceWaves() {
  const waveLevel = useAssistantStore((s) => s.waveLevel);
  const state = useAssistantStore((s) => s.state);
  const active = state === 'listening' || state === 'answering';

  return (
    <div className="flex h-16 items-center justify-center gap-1" data-state={state}>
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-accent-cyan"
          animate={
            active
              ? { height: [8, 8 + ((i % 5) + 1) * 8 * (0.4 + waveLevel), 8] }
              : { height: 6 }
          }
          transition={{
            duration: 0.6 + (i % 4) * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.02,
          }}
          style={{ opacity: active ? 0.9 : 0.3 }}
        />
      ))}
    </div>
  );
}