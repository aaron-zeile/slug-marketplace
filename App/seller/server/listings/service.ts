import { ListingSchema, type Listing } from '../../shared/index.js'

const ITEMS_SERVICE_URL = 'http://localhost:4000/graphql'

const TEMP_LISTING_ID = '50f1033c-020a-4a3a-9544-d7f9f0f0ba4d'

const GET_ITEM_QUERY = `
  query GetItem($id: String!) {
    item(input: { id: $id }) {
      id
      seller
      name
      description
      price
      created_at
    }
  }
`

export class ListingService {
  public async list(): Promise<Listing[]>  {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ITEM_QUERY,
        variables: {
          id: TEMP_LISTING_ID
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`)
    }

    const body = await response.json()

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error')
    }

    const parseResult = ListingSchema.safeParse(body.data?.item)

    if(!parseResult.success) {
      throw new Error('Item response did not match expected listing schema')
    }

    return [parseResult.data]
  }
}