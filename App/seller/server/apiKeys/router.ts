import type { Request, Response } from 'express';
import { z } from 'zod';

import { createApiKey, listApiKeys, revokeApiKey } from '../auth/service.js';

const ApiKeyRequestSchema = z.object({
  name: z.string().min(1).max(128),
});

export const post = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }

  const input = ApiKeyRequestSchema.parse(req.body);
  const apiKey = await createApiKey(req.sessionToken, input.name);

  res.status(201).json(apiKey);
};

export const get = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }

  res.json({ keys: await listApiKeys(req.sessionToken) });
};

export const remove = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }

  const id = req.params.id;
  if (typeof id !== 'string') {
    res.sendStatus(400);
    return;
  }

  await revokeApiKey(req.sessionToken, id);
  res.sendStatus(204);
};
