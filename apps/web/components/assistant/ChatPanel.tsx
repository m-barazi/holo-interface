'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { GlassCard, NeonButton } from '@holo/ui';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useSocketStore } from '@/stores/useSocketStore';

/** Chat-Panel: Nachrichtenverlauf + Eingabe, sendet via Socket. */
export function ChatPanel() {
  const t = useTranslations('assistant');
  const [input, setInput] = useState('');
  const messages = useAssistantStore((s) => s.messages);
  const streaming = useAssistantStore((s) => s.streaming);
  const id = useAssistantStore((s) => s.id);
  const addUser = useAssistantStore((s) => s.addUser);
  const send = useSocketStore((s) => s.send);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    addUser(prompt);
    send('assistant:query', {
      prompt,
      assistantId: id,
      modelId: 'mock-1',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 512,
    });
    setInput('');
  };

  return (
    <GlassCard className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="mb-3 min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-txt-muted">{t('placeholder')}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-accent-blue/20 text-txt-primary'
                : 'mr-auto glass text-txt-primary'
            }`}
          >
            {m.content}
          </div>
        ))}
        {streaming && (
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent-cyan" />
        )}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent-cyan focus:outline-none"
        />
        <NeonButton type="submit" accent="cyan">
          <Send className="h-4 w-4" />
        </NeonButton>
      </form>
    </GlassCard>
  );
}