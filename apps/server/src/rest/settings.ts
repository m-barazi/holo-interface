import { Router } from 'express';

export const settingsRouter = Router();

const settings = {
  user: { id: 'u1', name: 'm-barazi', role: 'admin' },
  security: { twoFactor: false, sessions: 1 },
  apiKeys: [{ id: 'key1', label: 'OpenAI (masked)', value: 'sk-••••••••••••abcd' }],
  backups: [{ id: 'b1', date: '2026-06-29', size: '12 MB' }],
};

settingsRouter.get('/', (_req, res) => res.json(settings));
settingsRouter.patch('/', (req, res) => {
  Object.assign(settings, req.body ?? {});
  res.json(settings);
});