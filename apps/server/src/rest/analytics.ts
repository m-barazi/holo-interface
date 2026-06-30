import { Router } from 'express';

export const analyticsRouter = Router();

analyticsRouter.get('/', (_req, res) => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    queries: 20 + Math.round(Math.random() * 80),
    avgLatencyMs: 300 + Math.round(Math.random() * 400),
    errors: Math.round(Math.random() * 5),
    tokensOut: 1000 + Math.round(Math.random() * 4000),
  }));
  res.json({ days, modelPerformance: [{ model: 'mock-1', tokPerS: 120 }, { model: 'mock-cloud', tokPerS: 60 }] });
});