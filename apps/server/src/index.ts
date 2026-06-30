import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server as IOServer } from 'socket.io';
import 'dotenv/config';
import { attachSockets } from './sockets/index.js';
import { assistantsRouter } from './rest/assistants.js';
import { knowledgeRouter } from './rest/knowledge.js';
import { automationRouter } from './rest/automation.js';
import { settingsRouter } from './rest/settings.js';
import { logsRouter } from './rest/logs.js';
import { analyticsRouter } from './rest/analytics.js';
import { ApiError, errorHandler } from './rest/error.js';

export interface RunningServer {
  http: http.Server;
  io: IOServer;
  port: number;
  close: () => Promise<void>;
}

export async function createServer(opts: { port: number; corsOrigin: string }): Promise<RunningServer> {
  const app = express();
  app.use(cors({ origin: opts.corsOrigin }));
  app.use(express.json());

  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/assistants', assistantsRouter);
  app.use('/api/knowledge', knowledgeRouter);
  app.use('/api/automation', automationRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/logs', logsRouter);
  app.use('/api/analytics', analyticsRouter);

  app.use(() => {
    throw new ApiError('not_found', 404, 'Route not found');
  });
  app.use(errorHandler);

  const httpServer = http.createServer(app);
  const io = new IOServer(httpServer, { cors: { origin: opts.corsOrigin } });
  attachSockets(io);

  await new Promise<void>((resolve) => httpServer.listen(opts.port, () => resolve()));

  const actualPort = (httpServer.address() as { port: number }).port;

  return {
    http: httpServer,
    io,
    port: actualPort,
    close: () => new Promise((resolve) => httpServer.close(() => resolve())),
  };
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  createServer({ port, corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });
  console.log(`[server] listening on :${port}`);
}