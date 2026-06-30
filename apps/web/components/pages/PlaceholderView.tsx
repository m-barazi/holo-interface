'use client';

import { useTranslations } from 'next-intl';
import { GlassCard } from '@holo/ui';
import { Construction } from 'lucide-react';

export function PlaceholderView({ title }: { title: string }) {
  const t = useTranslations('dashboard');
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-txt-primary">{title}</h1>
      <GlassCard className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <Construction className="h-8 w-8 text-accent-violet" />
        <p className="text-sm text-txt-secondary">{t('comingSoon')}</p>
      </GlassCard>
    </div>
  );
}