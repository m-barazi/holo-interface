import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Accent = 'cyan' | 'violet' | 'blue';

const glow: Record<Accent, string> = {
  cyan: 'shadow-[0_0_24px_rgba(34,211,238,0.4)]',
  violet: 'shadow-[0_0_24px_rgba(168,85,247,0.4)]',
  blue: 'shadow-[0_0_24px_rgba(59,130,246,0.4)]',
};

const borderHover: Record<Accent, string> = {
  cyan: 'hover:border-accent-cyan',
  violet: 'hover:border-accent-violet',
  blue: 'hover:border-accent-blue',
};

export function NeonButton({
  children,
  onClick,
  type = 'button',
  accent = 'cyan',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  accent?: Accent;
  className?: string;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`rounded-md border border-white/10 bg-white/5 px-4 py-2 text-txt-primary transition-colors ${borderHover[accent]} ${glow[accent]} ${className}`}
    >
      {children}
    </motion.button>
  );
}