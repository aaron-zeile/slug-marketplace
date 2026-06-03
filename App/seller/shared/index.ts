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
  quantity: z.number().int().min(1),
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

const orderStatusSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  return value.toLowerCase()
}, z.enum(['ordered', 'shipping', 'delivered']))

/** Parses order JSON from the Order GraphQL service (enum names are uppercase). */
export const OrderSchema = z.object({
  id: z.string(),
  buyer: z.string(),
  items: z.array(OrderItemSchema),
  orderedAt: z.coerce.string(),
  purchaseAmount: z.number(),
  status: orderStatusSchema,
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

export const DiscountSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  discountPercent: z.number().min(0).max(100),
  duration: z.number().int().min(1),
  created_at: z.string(),
})

export const NewDiscountSchema = z.object({
  itemId: z.string(),
  discountPercent: z.number().min(0).max(100),
  duration: z.number().int().min(1),
})

export const DiscountsResponseSchema = z.object({
  discounts: z.array(DiscountSchema),
})

export const CreateDiscountResponseSchema = z.object({
  discount: DiscountSchema,
})

export const ApiKeyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  created_at: z.string(),
})

export const ApiKeyMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
  revoked_at: z.string().optional(),
})

export const ApiKeysResponseSchema = z.object({
  keys: z.array(ApiKeyMetadataSchema),
})

export type Listing = z.infer<typeof ListingSchema>;
export type NewListing = z.infer<typeof NewListingSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Discount = z.infer<typeof DiscountSchema>;
export type NewDiscount = z.infer<typeof NewDiscountSchema>;
export type ApiKeyResponse = z.infer<typeof ApiKeyResponseSchema>;
export type ApiKeyMetadata = z.infer<typeof ApiKeyMetadataSchema>;
