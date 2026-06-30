export type AssistantState =
  | 'online'
  | 'offline'
  | 'listening'
  | 'thinking'
  | 'answering'
  | 'error';

export interface AssistantSummary {
  id: string;
  name: string;
  state: AssistantState;
  modelId: string;
}

export interface ChatChunk {
  delta: string;
  tokensIn: number;
  tokensOut: number;
}

export interface QueryRequest {
  prompt: string;
  assistantId: string;
  modelId: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}