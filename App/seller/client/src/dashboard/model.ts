import {
  CreateListingResponseSchema,
  ListingsResponseSchema,
  type Listing,
  type NewListing,
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
