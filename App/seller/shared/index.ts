// ZOD SCHEMAS GO HERE
import {z} from 'zod'

export const ListingSchema = z.object({
  id: z.string(),
  seller: z.object({
    id: z.string(),
    name: z.string(),
  }),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  quantity: z.number().int().min(0),
  created_at: z.string(),
  images: z.array(z.string()).default([]),
  status: z.enum(['active', 'sold'])
});
export const ListingsResponseSchema = z.object({
  listings: z.array(ListingSchema)
})

export const NewListingSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(1024),
  price: z.number().min(0),
  images: z.array(z.string()).default([]),
  quantity: z.number().int().min(1).optional(),
})

export const CreateListingResponseSchema = z.object({
  listing: ListingSchema
})

export const OrderItemSchema = z.object({
  itemId: z.string(),
  sellerId: z.string(),
})

export const OrderAddressSchema = z.object({
  label: z.string().nullish(),
  line1: z.string(),
  line2: z.string().nullish(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
})

export const OrderSchema = z.object({
  id: z.string(),
  buyer: z.string(),
  items: z.array(OrderItemSchema),
  orderedAt: z.string(),
  purchaseAmount: z.number(),
  address: OrderAddressSchema,
})

export const OrdersResponseSchema = z.object({
  orders: z.array(OrderSchema),
})

export const ReviewSchema = z.object({
  id: z.string(),
  user: z.object({ id: z.string(), name: z.string() }),
  rating: z.number(),
  content: z.string(),
  created_at: z.string(),
});
export const ReviewsResponseSchema = z.object({ reviews: z.array(ReviewSchema) });

export type Listing = z.infer<typeof ListingSchema>;
export type NewListing = z.infer<typeof NewListingSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Review = z.infer<typeof ReviewSchema>;
