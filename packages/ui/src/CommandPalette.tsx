import { m, AnimatePresence } from 'framer-motion';

export interface CommandItem {
  id: string;
  label: string;
  onSelect: () => void;
}

export function CommandPalette({
  open,
  items,
  onClose,
}: {
  open: boolean;
  items: CommandItem[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <m.div
            role="palette"
            className="relative w-full max-w-xl rounded-lg border border-white/10 bg-elev-2/90 backdrop-blur-glass-strong p-2"
            initial={{ y: -8 }}
            animate={{ y: 0 }}
          >
            {items.map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  i.onSelect();
                  onClose();
                }}
                className="block w-full rounded px-3 py-2 text-left text-txt-primary hover:bg-white/10"
              >
                {i.label}
              </button>
            ))}
            {items.length === 0 && (
              <div className="px-3 py-2 text-sm text-txt-muted">Keine Befehle</div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}