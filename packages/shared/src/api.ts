export type ModelTier = 'local' | 'cloud';

export interface ModelInfo {
  id: string;
  name: string;
  tier: ModelTier;
  contextSize: number;
  speedTokPerS: number;
}

export interface Context {
  system: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface StreamChunk {
  delta: string;
  tokensIn: number;
  tokensOut: number;
}

export interface LLMAdapter {
  stream(req: {
    prompt: string;
    context: Context;
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
  }): AsyncIterable<StreamChunk>;
  models(): Promise<ModelInfo[]>;
}