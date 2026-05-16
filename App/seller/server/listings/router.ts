import type { Request, Response } from 'express';
import { ListingService } from './service.js';
import { NewListingSchema } from '../../shared/index.js';

export const get = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  const status = req.query.status === 'sold' ? 'sold' : 'active'

  res.json({
    listings: await new ListingService().getListings(req.user.id, status),
  });
};

export const post = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionToken) {
    res.sendStatus(401);
    return;
  }

  const input = NewListingSchema.parse(req.body);
  const listing = await new ListingService().createListing(
    input,
    req.sessionToken,
  );

  res.status(201).json({ listing });
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

  await new ListingService().deleteListing(id, req.sessionToken);
  res.sendStatus(204);
};
