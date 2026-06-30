import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function FloatingPanel({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose?: () => void;
  title?: string;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed z-50 w-80 rounded-lg border border-white/10 bg-elev-2/80 backdrop-blur-glass-strong p-3 shadow-xl"
      style={{ top: 80, right: 24 }}
    >
      <div className="mb-2 flex items-center justify-between text-sm text-txt-secondary">
        <span>{title}</span>
        {onClose && (
          <button onClick={onClose} aria-label="close" className="hover:text-txt-primary">
            ✕
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}