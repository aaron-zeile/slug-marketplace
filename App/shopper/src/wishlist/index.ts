import * as z from 'zod';
import { ItemSchema } from '../shared/item';

export const WishlistEntrySchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: z.uuid(),
  createdAt: z.coerce.date(),
});

export const WishlistItemSchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: ItemSchema,
  createdAt: z.coerce.date(),
});

export type WishlistEntry = z.infer<typeof WishlistEntrySchema>;
export type WishlistItem = z.infer<typeof WishlistItemSchema>;
