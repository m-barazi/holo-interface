import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { StatusDock } from '@/components/shell/StatusDock';
import { GlobalShortcuts } from '@/components/shell/GlobalShortcuts';
import { Palette } from '@/components/shell/Palette';
import { ToasterHost } from '@/components/shell/ToasterHost';

export default async function ShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale);

  return (
    <div className="flex h-screen flex-col bg-bg-base text-txt-primary">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="relative min-h-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      <StatusDock />
      <GlobalShortcuts />
      <Palette />
      <ToasterHost />
    </div>
  );
}