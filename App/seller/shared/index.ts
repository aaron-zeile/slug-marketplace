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
  created_at: z.string(),
  images: z.array(z.string()).default([])
});
export const ListingsResponseSchema = z.object({
  listings: z.array(ListingSchema)
})

export const NewListingSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(1024),
  price: z.number().min(0),
  images: z.array(z.string()).default([])
})

export const CreateListingResponseSchema = z.object({
  listing: ListingSchema
})

export type Listing = z.infer<typeof ListingSchema>;
export type NewListing = z.infer<typeof NewListingSchema>;
