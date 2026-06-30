import type { Server as IOServer, Socket } from 'socket.io';
import type { AssistantState, QueryRequest, Context, LLMAdapter } from '@holo/shared';
import { createLLM } from '../llm/adapter.js';
import { logsStore } from '../store/index.js';

const stateByAssistant = new Map<string, AssistantState>();

function setState(io: IOServer, id: string, state: AssistantState) {
  stateByAssistant.set(id, state);
  io.emit('assistant:state', { assistantId: id, state });
  logsStore.push(`[assistant:${id}] state=${state}`);
}

export function attachAssistant(io: IOServer) {
  const llm: LLMAdapter = createLLM(process.env.LLM_ADAPTER as 'mock' | 'openai' | 'ollama' ?? 'mock');

  io.on('connection', (socket: Socket) => {
    logsStore.push(`[socket] connected ${socket.id}`);

    socket.on('assistant:query', async (req: QueryRequest) => {
      try {
        setState(io, req.assistantId, 'listening');
        await new Promise((r) => setTimeout(r, 300));
        setState(io, req.assistantId, 'thinking');

        const ctx: Context = {
          system: 'Du bist ein holografischer KI-Assistent namens Nova.',
          history: [],
        };
        const start = Date.now();
        let tokensIn = 0;
        let tokensOut = 0;
        let first = true;

        for await (const chunk of llm.stream({
          prompt: req.prompt,
          context: ctx,
          model: req.modelId,
          temperature: req.temperature,
          topP: req.topP,
          maxTokens: req.maxTokens,
        })) {
          if (first) {
            setState(io, req.assistantId, 'answering');
            first = false;
          }
          tokensIn += chunk.tokensIn;
          tokensOut += chunk.tokensOut;
          socket.emit('assistant:response', { assistantId: req.assistantId, chunk });
          socket.emit('assistant:wave', {
            assistantId: req.assistantId,
            level: 0.4 + Math.random() * 0.6,
          });
        }

        setState(io, req.assistantId, 'online');
        socket.emit('assistant:response:done', {
          assistantId: req.assistantId,
          tokensIn,
          tokensOut,
          latencyMs: Date.now() - start,
        });
      } catch (err) {
        setState(io, req.assistantId, 'error');
        socket.emit('assistant:response:done', {
          assistantId: req.assistantId,
          tokensIn: 0,
          tokensOut: 0,
          latencyMs: 0,
        });
        logsStore.push(`[assistant:${req.assistantId}] error: ${(err as Error).message}`);
      }
    });

    socket.on('assistant:abort', (s: { assistantId: string }) => {
      setState(io, s.assistantId, 'online');
    });

    socket.on('assistant:mute', (s: { assistantId: string; muted: boolean }) => {
      logsStore.push(`[assistant:${s.assistantId}] mute=${s.muted}`);
    });

    socket.on('avatar:command', (c) => {
      io.emit('avatar:command', c);
    });
  });

  return {
    getState: () => (stateByAssistant.values().next().value ?? 'online'),
  };
}