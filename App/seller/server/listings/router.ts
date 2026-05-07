import type { Request, Response } from 'express'
import { ListingService } from './service'

export const get = async (_req: Request, res: Response) => {
  res.json({
    listings: await new ListingService().getListings()
  })
}