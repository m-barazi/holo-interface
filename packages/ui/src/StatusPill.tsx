import { m } from 'framer-motion';
import type { AssistantState } from '@holo/shared';

const stateColor: Record<AssistantState, string> = {
  online: 'bg-state-online',
  thinking: 'bg-state-thinking',
  answering: 'bg-state-answering',
  error: 'bg-state-error',
  offline: 'bg-state-offline',
  listening: 'bg-state-online',
};

export function StatusPill({ state, label }: { state: AssistantState; label: string }) {
  return (
    <span
      data-state={state}
      className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-sm text-txt-primary"
    >
      <m.span
        className={`inline-block h-2 w-2 rounded-full ${stateColor[state]}`}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label}
    </span>
  );
}