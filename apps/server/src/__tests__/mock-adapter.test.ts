import { describe, it, expect } from 'vitest';
import { createLLM } from '../llm/adapter';

describe('mock adapter', () => {
  it('lists at least one local model', async () => {
    const llm = createLLM('mock');
    const models = await llm.models();
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.tier === 'local')).toBe(true);
  });

  it('streams multiple chunks with delta text', async () => {
    const llm = createLLM('mock');
    const chunks: string[] = [];
    for await (const c of llm.stream({
      prompt: 'Hallo',
      context: { system: '', history: [] },
      model: 'mock-1',
      temperature: 0.7,
      topP: 1,
      maxTokens: 50,
    })) {
      chunks.push(c.delta);
    }
    expect(chunks.join('').length).toBeGreaterThan(0);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('throws for unimplemented adapters', () => {
    expect(() => createLLM('openai')).toThrow();
  });
});