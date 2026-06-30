import type { LLMAdapter, StreamChunk, ModelInfo } from '@holo/shared';

export class MockLLM implements LLMAdapter {
  private modelList: ModelInfo[] = [
    { id: 'mock-1', name: 'Holo-Mock v1', tier: 'local', contextSize: 8192, speedTokPerS: 120 },
    { id: 'mock-cloud', name: 'Holo-Cloud (sim)', tier: 'cloud', contextSize: 32768, speedTokPerS: 60 },
  ];

  async models(): Promise<ModelInfo[]> {
    return this.modelList;
  }

  async *stream(req: {
    prompt: string;
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
  }): AsyncIterable<StreamChunk> {
    const reply = `Mock-Antwort auf „${req.prompt.slice(0, 40)}" (Temp ${req.temperature}). Das Holo-Interface funktioniert — Avatar-Status wird live gesteuert.`;
    const words = reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 35));
      yield { delta: (i ? ' ' : '') + words[i], tokensIn: Math.round(req.prompt.length / 4), tokensOut: 1 };
    }
  }
}