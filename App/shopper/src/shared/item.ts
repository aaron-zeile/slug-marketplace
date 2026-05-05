// MOVE TO A SHARED FOLDER BETWEEN SERVICES AND APP
import * as z from 'zod';

export const ItemSchema = z.object({
  id: z.uuid({ version: 'v4' }),
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(1024),
  price: z.number(),
  created_at: z.iso.datetime(),
});
