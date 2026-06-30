import type { LLMAdapter } from '@holo/shared';
import { MockLLM } from './mock.js';

export function createLLM(kind: 'mock' | 'openai' | 'ollama' = 'mock'): LLMAdapter {
  if (kind === 'mock') return new MockLLM();
  throw new Error(`adapter "${kind}" not implemented yet`);
}