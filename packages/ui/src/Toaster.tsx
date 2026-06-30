import { m, AnimatePresence } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  tone?: 'info' | 'error';
}

export function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            className={`rounded-md px-4 py-2 text-sm text-white ${
              t.tone === 'error' ? 'bg-state-error/80' : 'bg-accent-blue/80'
            }`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {t.message}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}