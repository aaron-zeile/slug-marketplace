import type { Request, Response } from 'express';
import { z } from 'zod';

import { OrderService } from './service.js';

const UpdateOrderStatusBodySchema = z.object({
  status: z.enum(['shipping', 'delivered']),
});

export const get = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  res.json({
    orders: await new OrderService().getOrders(req.user.id),
  });
};

export const patchStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  const orderId = req.params.orderId;
  if (!orderId) {
    res.status(400).json({ error: 'Order id is required' });
    return;
  }

  const parsed = UpdateOrderStatusBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'status must be shipping or delivered' });
    return;
  }

  try {
    const order = await new OrderService().updateOrderStatus(
      req.user.id,
      orderId,
      parsed.data.status,
    );
    res.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update order';
    res.status(400).json({ error: message });
  }
};
