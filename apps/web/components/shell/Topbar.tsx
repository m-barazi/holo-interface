'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Search, Bell, Sun, Moon, Globe, User, Command } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useTelemetryStore } from '@/stores/useTelemetryStore';

export function Topbar() {
  const t = useTranslations('shell');
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setPalette = useUIStore((s) => s.setPalette);
  const connected = useTelemetryStore((s) => s.connected);
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = () => {
    const next = locale === 'de' ? 'en' : 'de';
    router.push(`/${next === 'de' ? '' : next}`.replace('//', '/') || '/');
  };

  return (
    <header className="flex h-16 items-center gap-3 glass-strong border-b border-white/10 px-4">
      <button
        onClick={() => setPalette(true)}
        className="flex flex-1 items-center gap-2 rounded-md glass px-3 py-2 text-sm text-txt-muted hover:text-txt-secondary"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t('search')}</span>
        <kbd className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        <span
          className={`h-2 w-2 rounded-full ${connected ? 'bg-state-online' : 'bg-state-error'}`}
          title={connected ? 'connected' : 'disconnected'}
        />
      </div>

      <IconBtn label="quick actions" />
      <IconBtn label="notifications" icon={<Bell className="h-4 w-4" />} badge />
      <IconBtn label="profile" icon={<User className="h-4 w-4" />} />
      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-txt-secondary hover:bg-white/5 hover:text-txt-primary"
        aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        onClick={switchLocale}
        className="flex items-center gap-1 rounded-md p-2 text-txt-secondary hover:bg-white/5 hover:text-txt-primary"
        aria-label={t('language')}
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs uppercase">{locale}</span>
      </button>
    </header>
  );
}

function IconBtn({
  label,
  icon,
  badge,
}: {
  label: string;
  icon?: React.ReactNode;
  badge?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="relative rounded-md p-2 text-txt-secondary hover:bg-white/5 hover:text-txt-primary"
    >
      {icon ?? <Search className="h-4 w-4" />}
      {badge && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent-violet" />
      )}
    </button>
  );
}