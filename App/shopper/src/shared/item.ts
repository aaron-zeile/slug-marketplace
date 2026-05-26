import * as z from 'zod';

export const ItemSchema = z.object({
  id: z.uuid({ version: 'v4' }),
  seller: z.object({
    id: z.uuid({ version: 'v4' }),
    name: z.string().min(1).max(256),
  }),
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(1024),
  images: z.array(z.string().url()).max(5),
  price: z.number(),
  quantity: z.number().int().min(0),
  created_at: z.iso.datetime(),
  status: z.enum(['active', 'sold'])
});
