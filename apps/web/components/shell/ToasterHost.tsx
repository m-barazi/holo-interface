'use client';

import { Toaster } from '@holo/ui';
import { useToastStore } from '@/stores/useToastStore';

export function ToasterHost() {
  const toasts = useToastStore((s) => s.toasts);
  return <Toaster toasts={toasts} />;
}