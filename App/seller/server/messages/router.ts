import type { Request, Response } from 'express';
import { z } from 'zod';
import { MessageService } from './service.js';

const NewMessageSchema = z.object({
  subject: z.string().min(1).max(256),
  body: z.string().min(1).max(2048),
});

export const post = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  const input = NewMessageSchema.parse(req.body);
  await new MessageService().sendMessage(req.user, input);
  res.status(201).json({ ok: true });
};
