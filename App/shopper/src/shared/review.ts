import * as z from 'zod';

export const ReviewSchema = z.object({
  id: z.uuid({ version: 'v4' }),
  user: z.object({
    id: z.uuid({ version: 'v4' }),
    name: z.string().min(1).max(256),
  }),
  rating: z.number().min(1).max(5),
  content: z.string().min(1).max(1024),
  created_at: z.iso.datetime(),
});
