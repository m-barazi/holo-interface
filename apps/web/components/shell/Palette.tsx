'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/app/i18n/navigation';
import { CommandPalette, type CommandItem } from '@holo/ui';
import { NAV_ITEMS } from './NavItems';
import { useUIStore } from '@/stores/useUIStore';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useSocketStore } from '@/stores/useSocketStore';

export function Palette() {
  const t = useTranslations('nav');
  const open = useUIStore((s) => s.paletteOpen);
  const setPalette = useUIStore((s) => s.setPalette);
  const router = useRouter();
  const assistantId = useAssistantStore((s) => s.id);
  const emitMute = useSocketStore((s) => s.emitMute);
  const muted = useAssistantStore((s) => s.muted);

  const items: CommandItem[] = NAV_ITEMS.map((item) => ({
    id: `nav-${item.key}`,
    label: t(item.key),
    onSelect: () => router.push(item.key === 'dashboard' ? '/' : `/${item.key}`),
  }));

  items.push({
    id: 'action-mute',
    label: muted ? 'Assistent entstummen' : 'Assistent stumm schalten',
    onSelect: () => {
      const next = !muted;
      useAssistantStore.getState().setMuted(next);
      emitMute(assistantId, next);
    },
  });

  return <CommandPalette open={open} items={items} onClose={() => setPalette(false)} />;
}