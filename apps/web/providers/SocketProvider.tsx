'use client';

import { useEffect, type ReactNode } from 'react';
import { useSocketStore } from '@/stores/useSocketStore';
import { useTelemetryStore } from '@/stores/useTelemetryStore';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { resolveSocketUrl } from '@/lib/resolveSocketUrl';
import type { AssistantState, AvatarCommand } from '@holo/shared';

export function SocketProvider({ children }: { children: ReactNode }) {
  const init = useSocketStore((s) => s.init);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    const url = resolveSocketUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
    const socket = init(url);

    const updateTelemetry = useTelemetryStore.getState().update;
    const setConnected = useTelemetryStore.getState().setConnected;

    const onTelemetry = (tick: Parameters<typeof updateTelemetry>[0]) => updateTelemetry(tick);
    const onState = (e: { assistantId: string; state: AssistantState }) =>
      useAssistantStore.getState().setState(e.state);
    const onWave = (e: { assistantId: string; level: number }) =>
      useAssistantStore.getState().setWave(e.level);
    const onResponse = (e: { assistantId: string; chunk: { delta: string } }) =>
      useAssistantStore.getState().appendChunk({ delta: e.chunk.delta, tokensIn: 0, tokensOut: 0 });
    const onResponseDone = () => useAssistantStore.getState().finishStream();
    const onAvatar = (c: AvatarCommand) => useAvatarStore.getState().setCommand(c);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('telemetry:tick', onTelemetry);
    socket.on('assistant:state', onState);
    socket.on('assistant:wave', onWave);
    socket.on('assistant:response', onResponse);
    socket.on('assistant:response:done', onResponseDone);
    socket.on('avatar:command', onAvatar);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('telemetry:tick', onTelemetry);
      socket.off('assistant:state', onState);
      socket.off('assistant:wave', onWave);
      socket.off('assistant:response', onResponse);
      socket.off('assistant:response:done', onResponseDone);
      socket.off('avatar:command', onAvatar);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}