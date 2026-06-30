import { Router } from 'express';

export const knowledgeRouter = Router();

const docs = [
  { id: 'k1', title: 'Bedienungsanleitung Holo-Core', kind: 'pdf', size: 248_000 },
  { id: 'k2', title: 'API-Referenz', kind: 'web', size: 0 },
];

knowledgeRouter.get('/', (_req, res) => res.json(docs));
knowledgeRouter.post('/', (req, res) => {
  const doc = {
    id: `k${docs.length + 1}`,
    title: String(req.body?.title ?? 'Unbenannt'),
    kind: String(req.body?.kind ?? 'note'),
    size: Number(req.body?.size ?? 0),
  };
  docs.push(doc);
  res.status(201).json(doc);
});