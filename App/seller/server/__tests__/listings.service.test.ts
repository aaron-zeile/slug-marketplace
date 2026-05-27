import {beforeEach, describe, expect, it, vi} from 'vitest'
import {ListingService} from '../listings/service.js'

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A helpful little hub.',
  price: 24.99,
  quantity: 8,
  created_at: '2025-07-18 23:28:50+00',
  images: [],
  status: 'active',
}

const review = {
  id: 'review-1',
  user: {
    id: 'buyer-1',
    name: 'Buyer One',
  },
  rating: 4.5,
  content: 'Great hub.',
  created_at: '2026-05-20T12:00:00.000Z',
}

describe('ListingService', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches seller listings from the items service', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          sellerItems: [listing],
        },
      }),
    })

    const listings = await new ListingService().getListings('seller-1', 'active')

    const [, request] = fetchMock.mock.calls[0] as [
      string,
      {body: string; headers: Record<string, string>},
    ]
    const body = JSON.parse(request.body)

    expect({
      listings,
      fetchCall: fetchMock.mock.calls[0],
      variables: body.variables,
      queryIncludesSellerItems: body.query.includes('sellerItems'),
    }).toEqual({
      listings: [listing],
      fetchCall: [
        'http://localhost:4500/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ],
      variables: {
        id: 'seller-1',
        status: 'active',
      },
      queryIncludesSellerItems: true,
    })
  })

  it('throws the graphql error message when listings fail', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [
          {
            message: 'Cannot query field sellerItems on type Query',
          },
        ],
      }),
    })

    await expect(
      new ListingService().getListings('seller-1', 'active'),
    ).rejects.toThrow('Cannot query field sellerItems on type Query')
  })

  it('throws the fallback graphql error when listing errors have no message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{}],
      }),
    })

    await expect(
      new ListingService().getListings('seller-1', 'active'),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when the items service response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    })

    await expect(
      new ListingService().getListings('seller-1', 'active'),
    ).rejects.toThrow('Failed to fetch listings: Internal Server Error')
  })

  it('throws when the listing response does not match the schema', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          sellerItems: [
            {
              id: 'item-1',
            },
          ],
        },
      }),
    })

    await expect(
      new ListingService().getListings('seller-1', 'active'),
    ).rejects.toThrow('Seller items response did not match expected listing schema')
  })

  it('creates a listing with the session token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          createItem: listing,
        },
      }),
    })

    const created = await new ListingService().createListing(
      {
        name: listing.name,
        description: listing.description,
        price: listing.price,
        images: [],
      },
      'session-token',
    )

    expect({
      created,
      fetchCall: fetchMock.mock.calls[0],
    }).toEqual({
      created: listing,
      fetchCall: [
        'http://localhost:4500/graphql',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer session-token',
          },
        }),
      ],
    })
  })

  it('deletes a listing with the session token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          deleteItem: true,
        },
      }),
    })

    await new ListingService().deleteListing('item-1', 'session-token')

    const [, request] = fetchMock.mock.calls[0] as [
      string,
      {body: string; headers: Record<string, string>},
    ]
    const body = JSON.parse(request.body)

    expect({
      authorization: request.headers.Authorization,
      variables: body.variables,
      queryIncludesDeleteItem: body.query.includes('deleteItem'),
    }).toEqual({
      authorization: 'Bearer session-token',
      variables: {
        id: 'item-1',
      },
      queryIncludesDeleteItem: true,
    })
  })

  it('updates a listing with the session token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updateItem: listing,
        },
      }),
    })

    const updated = await new ListingService().updateListing(
      'item-1',
      {
        name: listing.name,
        description: listing.description,
        price: listing.price,
        images: [],
      },
      'session-token',
    )

    const [, request] = fetchMock.mock.calls[0] as [
      string,
      {body: string; headers: Record<string, string>},
    ]
    const body = JSON.parse(request.body)

    expect({
      updated,
      authorization: request.headers.Authorization,
      variables: body.variables,
      queryIncludesUpdateItem: body.query.includes('updateItem'),
    }).toEqual({
      updated: listing,
      authorization: 'Bearer session-token',
      variables: {
        input: {
          id: 'item-1',
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
      },
      queryIncludesUpdateItem: true,
    })
  })

  it('fetches reviews for a listing from the items service', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          reviews: [review],
        },
      }),
    })

    const reviews = await new ListingService().getReviews('item-1')

    const [, request] = fetchMock.mock.calls[0] as [
      string,
      {body: string; headers: Record<string, string>},
    ]
    const body = JSON.parse(request.body)

    expect({
      reviews,
      fetchCall: fetchMock.mock.calls[0],
      variables: body.variables,
      queryIncludesReviews: body.query.includes('reviews'),
    }).toEqual({
      reviews: [review],
      fetchCall: [
        'http://localhost:4500/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ],
      variables: {
        input: {
          id: 'item-1',
        },
      },
      queryIncludesReviews: true,
    })
  })

  it('returns an empty review list when the items service omits reviews data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {},
      }),
    })

    await expect(new ListingService().getReviews('item-1')).resolves.toEqual([])
  })

  it('throws when fetching reviews receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
    })

    await expect(
      new ListingService().getReviews('item-1'),
    ).rejects.toThrow('Failed to fetch reviews: Service Unavailable')
  })

  it('throws the graphql error message when fetching reviews fails', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [
          {
            message: 'Cannot query field reviews on type Query',
          },
        ],
      }),
    })

    await expect(
      new ListingService().getReviews('item-1'),
    ).rejects.toThrow('Cannot query field reviews on type Query')
  })

  it('throws the fallback graphql error when review errors have no message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{}],
      }),
    })

    await expect(
      new ListingService().getReviews('item-1'),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when the create listing response does not match the schema', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          createItem: {
            id: 'item-1',
          },
        },
      }),
    })

    await expect(
      new ListingService().createListing(
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Created item response did not match expected listing schema')
  })

  it('throws when create listing receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
    })

    await expect(
      new ListingService().createListing(
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Failed to create listing: Bad Request')
  })

  it('throws the graphql error message when create listing fails', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [
          {
            message: 'Only sellers can create items',
          },
        ],
      }),
    })

    await expect(
      new ListingService().createListing(
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Only sellers can create items')
  })

  it('throws the fallback graphql error when create errors have no message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{}],
      }),
    })

    await expect(
      new ListingService().createListing(
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when delete listing is not confirmed', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          deleteItem: false,
        },
      }),
    })

    await expect(
      new ListingService().deleteListing('item-1', 'session-token'),
    ).rejects.toThrow('Delete item response did not confirm deletion')
  })

  it('throws when delete listing receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    })

    await expect(
      new ListingService().deleteListing('item-1', 'session-token'),
    ).rejects.toThrow('Failed to delete listing: Not Found')
  })

  it('throws the graphql error message when delete listing fails', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [
          {
            message: 'Item does not belong to seller',
          },
        ],
      }),
    })

    await expect(
      new ListingService().deleteListing('item-1', 'session-token'),
    ).rejects.toThrow('Item does not belong to seller')
  })

  it('throws the fallback graphql error when delete errors have no message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{}],
      }),
    })

    await expect(
      new ListingService().deleteListing('item-1', 'session-token'),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when update listing receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Conflict',
    })

    await expect(
      new ListingService().updateListing(
        'item-1',
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Failed to update listing: Conflict')
  })

  it('throws the graphql error message when update listing fails', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [
          {
            message: 'Cannot update sold item',
          },
        ],
      }),
    })

    await expect(
      new ListingService().updateListing(
        'item-1',
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Cannot update sold item')
  })

  it('throws the fallback graphql error when update errors have no message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{}],
      }),
    })

    await expect(
      new ListingService().updateListing(
        'item-1',
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when the update listing response does not match the schema', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updateItem: {
            id: 'item-1',
          },
        },
      }),
    })

    await expect(
      new ListingService().updateListing(
        'item-1',
        {
          name: listing.name,
          description: listing.description,
          price: listing.price,
          images: [],
        },
        'session-token',
      ),
    ).rejects.toThrow('Updated item response did not match expected listing schema')
  })
})
