'use client';

import { useTranslations } from 'next-intl';
import { GlassCard } from '@holo/ui';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useSocketStore } from '@/stores/useSocketStore';

const PRESETS = [
  'Fasse die aktuellen Systemmetriken zusammen.',
  'Welche Automationen sind aktiv?',
  'Erkläre den Holo-Modus in einem Satz.',
  'Zeige die letzten Warnungen.',
];

/** Schnellaktionen — senden einen vorgefertigten Prompt an den Assistenten. */
export function QuickActions() {
  const t = useTranslations('assistant');
  const id = useAssistantStore((s) => s.id);
  const addUser = useAssistantStore((s) => s.addUser);
  const send = useSocketStore((s) => s.send);

  const fire = (prompt: string) => {
    addUser(prompt);
    send('assistant:query', {
      prompt,
      assistantId: id,
      modelId: 'mock-1',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 512,
    });
  };

  return (
    <GlassCard>
      <h3 className="mb-2 text-sm text-txt-secondary">{t('placeholder').replace('…', '')}</h3>
      <div className="flex flex-col gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => fire(p)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-txt-secondary transition-colors hover:border-accent-cyan hover:text-txt-primary"
          >
            {p}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}