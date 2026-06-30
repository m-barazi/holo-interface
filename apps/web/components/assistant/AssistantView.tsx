'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { GlassCard, StatusPill } from '@holo/ui';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { mapStateToCommand } from '@holo/three-avatar';
import { VoiceWaves } from './VoiceWaves';
import { MicCamStatus } from './MicCamStatus';
import { ChatPanel } from './ChatPanel';
import { QuickActions } from './QuickActions';

// WebGL-Canvas nur im Browser laden — kein SSR.
const AvatarScene = dynamic(
  () => import('@holo/three-avatar').then((m) => m.AvatarScene),
  { ssr: false, loading: () => <AvatarFallback /> },
);

function AvatarFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="h-16 w-16 animate-pulse rounded-full bg-accent-cyan/30" />
    </div>
  );
}

/** KI-Assistent-View: Hologramm-Szene + Steuer- und Chat-Panel. */
export function AssistantView() {
  const t = useTranslations('assistant');
  const tStatus = useTranslations('status');
  const tNav = useTranslations('nav');
  const state = useAssistantStore((s) => s.state);
  const name = useAssistantStore((s) => s.name);
  const command = useAvatarStore((s) => s.command);
  const transform = useAvatarStore((s) => s.transform);
  const setCommand = useAvatarStore((s) => s.setCommand);
  const [mounted, setMounted] = useState(false);

  // Lokaler Fallback: State → Avatar-Command, falls der Server
  // (noch) keine avatar:command-Events sendet.
  useEffect(() => {
    setMounted(true);
    setCommand(mapStateToCommand(state));
  }, [state, setCommand]);

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Hologramm-Bühne */}
      <GlassCard className="relative flex min-h-[40vh] flex-1 flex-col overflow-hidden">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
          <StatusPill state={state} label={tStatus(state)} />
          <span className="text-sm text-txt-secondary">{name}</span>
        </div>
        <div className="absolute right-4 top-4 z-10">
          <MicCamStatus />
        </div>
        <div className="min-h-0 flex-1">
          {mounted ? (
            <AvatarScene command={command} transform={transform} className="h-full w-full" />
          ) : (
            <AvatarFallback />
          )}
        </div>
        <div className="absolute bottom-4 left-0 right-0 z-10 px-6">
          <VoiceWaves />
        </div>
      </GlassCard>

      {/* Seitenpanel: Chat + Schnellaktionen */}
      <div className="flex w-full flex-col gap-4 lg:w-[26rem]">
        <h1 className="text-2xl font-semibold text-txt-primary">{tNav('assistant')}</h1>
        <QuickActions />
        <ChatPanel />
        <GlassCard>
          <p className="text-xs text-txt-muted">
            {t('model')}: mock-1 · {t('scene')}: Holo
          </p>
        </GlassCard>
      </div>
    </div>
  );
}