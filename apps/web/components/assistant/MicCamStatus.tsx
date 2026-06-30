'use client';

import { useTranslations } from 'next-intl';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { NeonButton } from '@holo/ui';
import { useDeviceStore } from '@/stores/useDeviceStore';

/** Mikrofon-/Kamera-Toggle mit Status-Anzeige (WebRTC-Stub). */
export function MicCamStatus() {
  const t = useTranslations('assistant');
  const micOn = useDeviceStore((s) => s.micOn);
  const camOn = useDeviceStore((s) => s.camOn);
  const toggleMic = useDeviceStore((s) => s.toggleMic);
  const toggleCam = useDeviceStore((s) => s.toggleCam);

  return (
    <div className="flex items-center gap-2">
      <NeonButton accent="cyan" onClick={toggleMic}>
        <span className="flex items-center gap-2 text-sm">
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          {micOn ? t('mic') : t('mute')}
        </span>
      </NeonButton>
      <NeonButton accent="violet" onClick={toggleCam}>
        <span className="flex items-center gap-2 text-sm">
          {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          {t('camera')}
        </span>
      </NeonButton>
    </div>
  );
}