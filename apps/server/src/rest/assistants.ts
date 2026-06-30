import { Router } from 'express';
import { assistantsStore } from '../store/index.js';

export const assistantsRouter = Router();

assistantsRouter.get('/', (_req, res) => {
  res.json(assistantsStore.all());
});

assistantsRouter.post('/', (req, res) => {
  const created = assistantsStore.add(String(req.body?.name ?? ''));
  res.status(201).json(created);
});