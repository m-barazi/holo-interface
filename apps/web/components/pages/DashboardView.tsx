'use client';

import { useTranslations } from 'next-intl';
import { GlassCard, Sparkline, StatusPill } from '@holo/ui';
import { Link } from '@/app/i18n/navigation';
import { useTelemetryStore } from '@/stores/useTelemetryStore';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { Cpu, MemoryStick, Activity, Thermometer, Zap, Wifi } from 'lucide-react';

export function DashboardView() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const tStatus = useTranslations('status');
  const history = useTelemetryStore((s) => s.history);
  const current = useTelemetryStore((s) => s.current);
  const state = useAssistantStore((s) => s.state);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-txt-primary">{t('title')}</h1>
          <p className="text-sm text-txt-secondary">{t('welcome')}</p>
        </div>
        <StatusPill state={state} label={tStatus(state)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Cpu className="h-4 w-4" />} label="CPU" value={current?.cpu} data={history.map((h) => h.cpu)} color="#22D3EE" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="GPU" value={current?.gpu} data={history.map((h) => h.gpu)} color="#A855F7" />
        <StatCard icon={<MemoryStick className="h-4 w-4" />} label="RAM" value={current?.ram} data={history.map((h) => h.ram)} color="#3B82F6" />
        <StatCard icon={<Thermometer className="h-4 w-4" />} label="Temp" value={current?.temp} suffix="°C" data={history.map((h) => h.temp)} color="#2DD4BF" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <h2 className="mb-3 text-sm text-txt-secondary">{tNav('assistant')}</h2>
          <Link
            href="/assistant"
            className="flex h-48 items-center justify-center rounded-md border border-dashed border-white/10 text-txt-muted hover:border-accent-cyan hover:text-txt-primary"
          >
            Hologramm öffnen →
          </Link>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 text-sm text-txt-secondary">System</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="h-3 w-3" /> Energie</span>
              <span className="text-txt-primary">{current?.energy?.toFixed(0) ?? '--'} W</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="h-3 w-3" /> FPS</span>
              <span className="text-txt-primary">{current?.fps ?? '--'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Wifi className="h-3 w-3" /> API</span>
              <span className="text-txt-primary">{current?.apiStatus ?? '--'}</span>
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = '%',
  data,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  suffix?: string;
  data: number[];
  color: string;
}) {
  return (
    <GlassCard>
      <div className="mb-2 flex items-center gap-2 text-sm text-txt-secondary">
        {icon}
        {label}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-txt-primary">
          {value != null ? value.toFixed(0) : '--'}
          <span className="ml-1 text-xs text-txt-muted">{suffix}</span>
        </span>
        <Sparkline data={data} color={color} width={96} height={32} />
      </div>
    </GlassCard>
  );
}