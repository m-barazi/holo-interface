import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Mic,
  Box,
  Cpu,
  Workflow,
  BookOpen,
  BarChart3,
  Terminal,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  key: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'assistant', icon: Bot },
  { key: 'chat', icon: MessageSquare },
  { key: 'voice', icon: Mic },
  { key: 'hologram', icon: Box },
  { key: 'devices', icon: Cpu },
  { key: 'automation', icon: Workflow },
  { key: 'knowledge', icon: BookOpen },
  { key: 'analytics', icon: BarChart3 },
  { key: 'logs', icon: Terminal },
  { key: 'settings', icon: Settings },
];