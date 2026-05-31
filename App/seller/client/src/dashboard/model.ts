import {
  CreateListingResponseSchema,
  ListingsResponseSchema,
  OrdersResponseSchema,
  ReviewsResponseSchema,
  type Listing,
  type NewListing,
  type Order,
  type Review,
} from '../../../shared'

export const list = async (
  setError: (error: string | undefined) => void,
  setListings: (listings: Listing[]) => void
) : Promise<void> => {
  try {
    const response = await fetch('/seller/api/listings')
    if (!response.ok) throw new Error(response.statusText)

    const data = ListingsResponseSchema.parse(await response.json())
    setListings(data.listings)
    setError(undefined)

  } catch (error: unknown) {
    setError(String(error))
  }
}

export const create = async (
  input: NewListing,
  setError: (error: string | undefined) => void,
) : Promise<Listing | undefined> => {
  try {
    const response = await fetch('/seller/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error(response.statusText)

    const data = CreateListingResponseSchema.parse(await response.json())
    setError(undefined)
    return data.listing

  } catch (error: unknown) {
    setError(String(error))
    return undefined
  }
}

export const update = async (
  id: string,
  input: NewListing,
  setError: (error: string | undefined) => void,
) : Promise<Listing | undefined> => {
  try {
    const response = await fetch(`/seller/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error(response.statusText)

    const data = CreateListingResponseSchema.parse(await response.json())
    setError(undefined)
    return data.listing

  } catch (error: unknown) {
    setError(String(error))
    return undefined
  }
}

export const remove = async (
  id: string,
  setError: (error: string | undefined) => void,
) : Promise<boolean> => {
  try {
    const response = await fetch(`/seller/api/listings/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error(response.statusText)

    setError(undefined)
    return true

  } catch (error: unknown) {
    setError(String(error))
    return false
  }
}

export const getReviews = async (
  id: string,
  setError: (error: string | undefined) => void,
): Promise<Review[]> => {
  try {
    const response = await fetch(`/seller/api/listings/${id}/reviews`)
    if (!response.ok) throw new Error(response.statusText)
    const data = ReviewsResponseSchema.parse(await response.json())
    setError(undefined)
    return data.reviews
  } catch (error: unknown) {
    setError(String(error))
    return []
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: 'shipping' | 'delivered',
  setError: (error: string | undefined) => void,
  onUpdated: (order: Order) => void,
): Promise<void> => {
  try {
    const response = await fetch(`/seller/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    const body = await response.json() as { order?: Order; error?: string }
    if (!response.ok) {
      throw new Error(body.error ?? response.statusText)
    }

    if (!body.order) {
      throw new Error('Order update response was missing order data')
    }

    onUpdated(body.order)
    setError(undefined)
  } catch (error: unknown) {
    setError(String(error))
  }
}

export const listOrders = async (
  setError: (error: string | undefined) => void,
  setOrders: (orders: Order[]) => void
) : Promise<void> => {
  try {
    const response = await fetch('/seller/api/orders')
    if (!response.ok) throw new Error(response.statusText)

    const data = OrdersResponseSchema.parse(await response.json())
    setOrders(data.orders)
    setError(undefined)

  } catch (error: unknown) {
    setError(String(error))
  }
}

export async function avgRating(
  setError: (error: string | undefined) => void,
): Promise<number | undefined> {
  try {
    const response = await fetch('/seller/api/analytics/average-rating')
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const body = await response.json()
    return body.averageRating
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to load rating')
    return undefined
  }
}
