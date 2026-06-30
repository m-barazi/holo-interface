'use client';

import { useTranslations } from 'next-intl';
import { Cpu, MemoryStick, Thermometer, Activity, ChevronDown } from 'lucide-react';
import { Sparkline, StatusPill } from '@holo/ui';
import { useTelemetryStore } from '@/stores/useTelemetryStore';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useUIStore } from '@/stores/useUIStore';

export function StatusDock() {
  const t = useTranslations('shell');
  const visible = useUIStore((s) => s.dockVisible);
  const toggleDock = useUIStore((s) => s.toggleDock);
  const history = useTelemetryStore((s) => s.history);
  const current = useTelemetryStore((s) => s.current);
  const state = useAssistantStore((s) => s.state);

  if (!visible) {
    return (
      <button
        onClick={toggleDock}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-3 py-1.5 text-xs text-txt-secondary hover:text-txt-primary"
      >
        ▴ {t('dock')}
      </button>
    );
  }

  const cpu = history.map((h) => h.cpu);
  const gpu = history.map((h) => h.gpu);
  const ram = history.map((h) => h.ram);

  return (
    <footer className="flex h-10 items-center gap-4 glass-strong border-t border-white/10 px-4 text-xs text-txt-secondary">
      <StatusPill state={state} label={state} />
      <DockMetric icon={<Cpu className="h-3 w-3" />} label="CPU" value={current?.cpu} data={cpu} color="#22D3EE" />
      <DockMetric icon={<Activity className="h-3 w-3" />} label="GPU" value={current?.gpu} data={gpu} color="#A855F7" />
      <DockMetric icon={<MemoryStick className="h-3 w-3" />} label="RAM" value={current?.ram} data={ram} color="#3B82F6" />
      <span className="flex items-center gap-1">
        <Thermometer className="h-3 w-3" /> {current?.temp?.toFixed(0) ?? '--'}°C
      </span>
      <span>FPS {current?.fps ?? '--'}</span>
      <button
        onClick={toggleDock}
        className="ml-auto rounded p-1 hover:text-txt-primary"
        aria-label={t('collapse')}
      >
        <ChevronDown className="h-3 w-3" />
      </button>
    </footer>
  );
}

function DockMetric({
  icon,
  label,
  value,
  data,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  data: number[];
  color: string;
}) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span className="w-8">{label}</span>
      <span className="w-10 text-right text-txt-primary">{value?.toFixed(0) ?? '--'}%</span>
      <Sparkline data={data} color={color} width={64} height={18} />
    </span>
  );
}