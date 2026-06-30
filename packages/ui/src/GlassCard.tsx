import { m } from 'framer-motion';
import type { ReactNode } from 'react';

export function GlassCard({
  children,
  className = '',
  strong = false,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
}) {
  return (
    <m.div
      className={`rounded-lg border border-white/10 backdrop-blur-glass p-4 shadow-lg shadow-black/20 ${
        strong ? 'bg-white/10' : 'bg-white/5'
      } ${className}`}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </m.div>
  );
}