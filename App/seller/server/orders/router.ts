import type { Request, Response } from 'express';
import { OrderService } from './service.js';

export const get = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  res.json({
    orders: await new OrderService().getOrders(req.user.id),
  });
};
