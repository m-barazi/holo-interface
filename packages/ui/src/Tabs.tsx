import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue?: string }) {
  return (
    <RadixTabs.Root defaultValue={defaultValue ?? tabs[0]?.value}>
      <RadixTabs.List className="flex gap-2">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className="rounded-md px-3 py-1.5 text-sm text-txt-secondary data-[state=active]:bg-white/10 data-[state=active]:text-txt-primary"
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((t) => (
        <RadixTabs.Content key={t.value} value={t.value} className="mt-4">
          {t.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}