import { Router } from 'express';
import { logsStore } from '../store/index.js';

export const logsRouter = Router();

logsRouter.get('/', (req, res) => {
  const limit = Math.min(Number(req.query?.limit ?? 100), 500);
  res.json({ lines: logsStore.list(limit) });
});