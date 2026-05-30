import type { Request, Response } from 'express';
import { AnalyticsService } from './service';

export const getAvgRating = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }
  const avg = await new AnalyticsService().getAvgRating(req.user.id);
  res.json({avg})
}