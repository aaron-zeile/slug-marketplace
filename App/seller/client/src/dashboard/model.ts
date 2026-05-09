import { ListingsResponseSchema, type Listing } from '../../../shared'

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
