import * as z from 'zod';
import { ItemSchema } from '../shared/item';

export const ViewedItemEntrySchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: z.uuid(),
  viewedAt: z.coerce.date(),
});

export const ViewedItemSchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  item: ItemSchema,
  viewedAt: z.coerce.date(),
});

export type ViewedItemEntry = z.infer<typeof ViewedItemEntrySchema>;
export type ViewedItem = z.infer<typeof ViewedItemSchema>;
