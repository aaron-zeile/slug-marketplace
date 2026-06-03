import * as z from 'zod';

export const DiscountSchema = z.object({
  id: z.uuid({ version: 'v4' }),
  itemId: z.uuid({ version: 'v4' }),
  discountPercent: z.number().min(0).max(100),
  duration: z.number().int().min(1),
  created_at: z.iso.datetime(),
});

export const ActiveDiscountSchema = DiscountSchema.extend({
  ends_at: z.iso.datetime(),
  originalPrice: z.number().min(0),
});

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
  status: z.enum(['active', 'sold']),
  activeDiscount: ActiveDiscountSchema.nullable().optional(),
});
