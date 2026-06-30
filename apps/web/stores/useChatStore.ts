import { create } from 'zustand';

interface ChatEntry {
  id: string;
  assistantId: string;
  role: 'user' | 'assistant';
  content: string;
  favorite: boolean;
  ts: number;
}

interface ChatState {
  entries: ChatEntry[];
  search: string;
  setSearch: (s: string) => void;
  addEntry: (e: Omit<ChatEntry, 'id' | 'ts' | 'favorite'> & { id?: string }) => void;
  toggleFavorite: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  entries: [],
  search: '',
  setSearch: (search) => set({ search }),
  addEntry: (e) =>
    set((s) => ({
      entries: [
        ...s.entries,
        { id: e.id ?? `m${s.entries.length + 1}`, ts: Date.now(), favorite: false, ...e },
      ],
    })),
  toggleFavorite: (id) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)),
    })),
}));