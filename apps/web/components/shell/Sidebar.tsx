'use client';

import { Link, usePathname } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus } from 'lucide-react';
import { NAV_ITEMS } from './NavItems';
import { useUIStore } from '@/stores/useUIStore';
import { useAssistantStore } from '@/stores/useAssistantStore';

export function Sidebar() {
  const t = useTranslations('nav');
  const tShell = useTranslations('shell');
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const name = useAssistantStore((s) => s.name);
  const state = useAssistantStore((s) => s.state);

  return (
    <aside
      className={`flex h-full flex-col glass-strong border-r border-white/10 transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="h-8 w-8 shrink-0 rounded-md bg-accent-cyan shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        {!collapsed && <span className="text-sm font-semibold text-txt-primary">Holo-Interface</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const href = item.key === 'dashboard' ? '/' : `/${item.key}`;
          const active = item.key === 'dashboard' ? pathname === '/' : pathname === `/${item.key}`;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={href}
              data-nav={item.key}
              className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-white/10 text-txt-primary'
                  : 'text-txt-secondary hover:bg-white/5 hover:text-txt-primary'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        {!collapsed ? (
          <div className="rounded-md glass p-2">
            <div className="mb-1 flex items-center justify-between text-xs text-txt-muted">
              <span>{tShell('assistantSwitcher')}</span>
              <button className="hover:text-txt-primary" aria-label="new assistant">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-txt-primary">
              <span className="h-2 w-2 rounded-full bg-state-online" />
              {name}
              <span className="ml-auto text-xs text-txt-muted">{state}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-state-online" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs text-txt-muted hover:text-txt-primary"
        >
          <ChevronLeft className={`h-3 w-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && tShell('collapse')}
        </button>
      </div>
    </aside>
  );
}