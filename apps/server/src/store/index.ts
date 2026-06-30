import type { AssistantSummary } from '@holo/shared';

class LogsStore {
  private lines: string[] = [];
  push(line: string) {
    const stamped = `${new Date().toISOString()} ${line}`;
    this.lines.push(stamped);
    if (this.lines.length > 500) this.lines = this.lines.slice(-500);
  }
  list(limit = 100): string[] {
    return this.lines.slice(-limit);
  }
}

class AssistantsStore {
  private list: AssistantSummary[] = [
    { id: 'a1', name: 'Nova', state: 'online', modelId: 'mock-1' },
    { id: 'a2', name: 'Orion', state: 'offline', modelId: 'mock-cloud' },
  ];
  all(): AssistantSummary[] {
    return this.list;
  }
  add(name: string): AssistantSummary {
    const a: AssistantSummary = {
      id: `a${this.list.length + 1}`,
      name: name || 'Neuer Assistent',
      state: 'offline',
      modelId: 'mock-1',
    };
    this.list.push(a);
    return a;
  }
}

export const logsStore = new LogsStore();
export const assistantsStore = new AssistantsStore();