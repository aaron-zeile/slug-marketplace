import type { Request, Response } from 'express';
import { AnalyticsService } from './service.js';

export const getAvgRating = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }
  const avg = await new AnalyticsService().getAvgRating(req.user.id);
  res.json({averageRating: avg})
}

export const getStarDistribution = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }
  const ratings = await new AnalyticsService().getStarDistribution(req.user.id);
  res.json({ratings})
}

export const getSalesStats = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }
  const salesStats = await new AnalyticsService().getSalesStats(req.user.id);
  res.json({salesStats})
}
