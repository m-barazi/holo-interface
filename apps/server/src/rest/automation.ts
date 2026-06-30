import { Router } from 'express';

export const automationRouter = Router();

const workflows = [
  { id: 'w1', name: 'Morgenszene', trigger: 'schedule 07:00', actions: ['greeting', 'scene:day'] },
  { id: 'w2', name: 'Meeting-Modus', trigger: 'event calendar.start', actions: ['mute', 'scene:focus'] },
];

automationRouter.get('/', (_req, res) => res.json(workflows));
automationRouter.post('/', (req, res) => {
  const wf = {
    id: `w${workflows.length + 1}`,
    name: String(req.body?.name ?? 'Neue Automation'),
    trigger: String(req.body?.trigger ?? 'manual'),
    actions: (req.body?.actions as string[]) ?? [],
  };
  workflows.push(wf);
  res.status(201).json(wf);
});