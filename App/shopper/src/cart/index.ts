import * as z from 'zod';
import { ItemSchema } from '../shared/item';

export const CartEntrySchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: z.uuid(),
  quantity: z.number().int().min(1),
});

export const CartItemSchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: ItemSchema,
  quantity: z.number().int().min(1),
});

export type CartEntry = z.infer<typeof CartEntrySchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
