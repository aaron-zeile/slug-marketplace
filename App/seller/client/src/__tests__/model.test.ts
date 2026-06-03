import {describe, expect, it, vi} from 'vitest'

import {
  avgRating,
  create,
  createApiKey,
  createDiscount,
  getReviews,
  list,
  listApiKeys,
  listDiscounts,
  listOrders,
  remove,
  revokeApiKey,
  starDistribution,
  update,
  updateOrderStatus,
} from '../dashboard/model'

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  quantity: 1,
  created_at: '2025-07-18T23:28:50.000Z',
  images: [],
  status: 'active'
}

const discount = {
  id: 'discount-1',
  itemId: 'item-1',
  discountPercent: 15,
  duration: 7,
  created_at: '2026-06-03T12:00:00.000Z',
}

const order = {
  id: 'order-1',
  buyer: 'buyer-1',
  items: [{itemId: 'item-1', sellerId: 'seller-1'}],
  orderedAt: '2026-06-03T12:00:00.000Z',
  purchaseAmount: 24.99,
  status: 'ordered',
  address: {
    line1: '1156 High Street',
    line2: '',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
}

describe('dashboard model', () => {
  it('loads active listings and clears any previous error', async () => {
    const setError = vi.fn()
    const setListings = vi.fn()
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        listings: [listing],
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    await list(setError, setListings)

    expect({
      fetchCall: fetchMock.mock.calls[0],
      listingsCall: setListings.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      fetchCall: ['/seller/api/listings'],
      listingsCall: [[listing]],
      errorCall: [undefined],
    })
  })

  it('reports a listing load error without replacing listings', async () => {
    const setError = vi.fn()
    const setListings = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Internal Server Error',
      })),
    )

    await list(setError, setListings)

    expect({
      errorCall: setError.mock.calls[0],
      listingsCalls: setListings.mock.calls,
    }).toEqual({
      errorCall: ['Error: Internal Server Error'],
      listingsCalls: [],
    })
  })

  it('creates a listing and returns the parsed response', async () => {
    const setError = vi.fn()
    const input = {
      name: 'USB Hub',
      description: 'A useful hub.',
      price: 24.99,
      images: [],
      quantity: 1,
    }
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        listing,
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await create(input, setError)

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: listing,
      fetchCall: [
        '/seller/api/listings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        },
      ],
      errorCall: [undefined],
    })
  })

  it('returns undefined when create listing fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unauthorized',
      })),
    )

    const result = await create(
      {
        name: 'USB Hub',
        description: 'A useful hub.',
        price: 24.99,
        images: [],
        quantity: 1,
      },
      setError,
    )

    expect({
      result,
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: undefined,
      errorCall: ['Error: Unauthorized'],
    })
  })

  it('deletes a listing and clears any previous error', async () => {
    const setError = vi.fn()
    const fetchMock = vi.fn(async () => ({
      ok: true,
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await remove('item-1', setError)

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: true,
      fetchCall: [
        '/seller/api/listings/item-1',
        {
          method: 'DELETE',
        },
      ],
      errorCall: [undefined],
    })
  })

  it('returns false when delete listing fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Not Found',
      })),
    )

    const result = await remove('item-1', setError)

    expect({
      result,
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: false,
      errorCall: ['Error: Not Found'],
    })
  })

  it('loads discounts for a listing', async () => {
    const setError = vi.fn()
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        discounts: [discount],
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await listDiscounts('item-1', setError)

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: [discount],
      fetchCall: ['/seller/api/listings/item-1/discounts'],
      errorCall: [undefined],
    })
  })

  it('creates a discount and returns the parsed response', async () => {
    const setError = vi.fn()
    const input = {
      itemId: 'item-1',
      discountPercent: 15,
      duration: 7,
    }
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        discount,
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await createDiscount(input, setError)

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: discount,
      fetchCall: [
        '/seller/api/listings/item-1/discounts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discountPercent: 15,
            duration: 7,
          }),
        },
      ],
      errorCall: [undefined],
    })
  })

  it('updates a listing and returns the parsed response', async () => {
    const setError = vi.fn()
    const input = {
      name: 'USB Hub',
      description: 'A useful hub.',
      price: 24.99,
      images: [],
      quantity: 1,
    }
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({listing}),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await update('item-1', input, setError)

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
      errorCall: setError.mock.calls[0],
    }).toEqual({
      result: listing,
      fetchCall: [
        '/seller/api/listings/item-1',
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(input),
        },
      ],
      errorCall: [undefined],
    })
  })

  it('returns undefined when update listing fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Conflict',
      })),
    )

    const result = await update(
      'item-1',
      {
        name: 'USB Hub',
        description: 'A useful hub.',
        price: 24.99,
        images: [],
        quantity: 1,
      },
      setError,
    )

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Error: Conflict'],
    })
  })

  it('loads listing reviews', async () => {
    const setError = vi.fn()
    const review = {
      id: 'review-1',
      user: {id: 'buyer-1', name: 'Buyer'},
      rating: 4,
      content: 'Great.',
      created_at: '2026-06-03T12:00:00.000Z',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({reviews: [review]}),
      })),
    )

    const result = await getReviews('item-1', setError)

    expect(result).toEqual([review])
  })

  it('returns no reviews when review loading fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Not Found',
      })),
    )

    const result = await getReviews('item-1', setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: [],
      errorCall: ['Error: Not Found'],
    })
  })

  it('returns no discounts when discount loading fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Bad Request',
      })),
    )

    const result = await listDiscounts('item-1', setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: [],
      errorCall: ['Error: Bad Request'],
    })
  })

  it('returns undefined when discount creation fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Forbidden',
      })),
    )

    const result = await createDiscount(
      {itemId: 'item-1', discountPercent: 15, duration: 7},
      setError,
    )

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Error: Forbidden'],
    })
  })

  it('updates an order status', async () => {
    const setError = vi.fn()
    const onUpdated = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({order: {...order, status: 'shipping'}}),
      })),
    )

    await updateOrderStatus('order-1', 'shipping', setError, onUpdated)

    expect(onUpdated.mock.calls[0]).toEqual([{...order, status: 'shipping'}])
  })

  it('reports an order status update error body', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({error: 'Invalid transition'}),
      })),
    )

    await updateOrderStatus('order-1', 'shipping', setError, vi.fn())

    expect(setError.mock.calls[0]).toEqual(['Error: Invalid transition'])
  })

  it('reports an order status update error status text', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Conflict',
        json: async () => ({}),
      })),
    )

    await updateOrderStatus('order-1', 'shipping', setError, vi.fn())

    expect(setError.mock.calls[0]).toEqual(['Error: Conflict'])
  })

  it('reports an order status update missing body', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({}),
      })),
    )

    await updateOrderStatus('order-1', 'shipping', setError, vi.fn())

    expect(setError.mock.calls[0]).toEqual([
      'Error: Order update response was missing order data',
    ])
  })

  it('loads orders', async () => {
    const setError = vi.fn()
    const setOrders = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({orders: [order]}),
      })),
    )

    await listOrders(setError, setOrders)

    expect(setOrders.mock.calls[0]).toEqual([[order]])
  })

  it('reports order loading errors', async () => {
    const setError = vi.fn()
    const setOrders = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unavailable',
      })),
    )

    await listOrders(setError, setOrders)

    expect({errorCall: setError.mock.calls[0], ordersCalls: setOrders.mock.calls}).toEqual({
      errorCall: ['Error: Unavailable'],
      ordersCalls: [],
    })
  })

  it('loads average rating', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({averageRating: 4.5}),
      })),
    )

    const result = await avgRating(setError)

    expect(result).toBe(4.5)
  })

  it('reports non-error average rating failures', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw 'rating failed'
      }),
    )

    const result = await avgRating(setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Failed to load rating'],
    })
  })

  it('reports average rating response failures', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unauthorized',
      })),
    )

    const result = await avgRating(setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Unauthorized'],
    })
  })

  it('loads star distribution', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ratings: [1, 2, 3, 4, 5]}),
      })),
    )

    const result = await starDistribution(setError)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('reports non-error star distribution failures', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw 'distribution failed'
      }),
    )

    const result = await starDistribution(setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Failed to load rating distribution'],
    })
  })

  it('reports star distribution response failures', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unauthorized',
      })),
    )

    const result = await starDistribution(setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Unauthorized'],
    })
  })

  it('creates an api key', async () => {
    const setError = vi.fn()
    const apiKey = {
      id: 'key-1',
      name: 'Key',
      key: 'slug_sk_test',
      created_at: '2026-06-03T12:00:00.000Z',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => apiKey,
      })),
    )

    const result = await createApiKey('Key', setError)

    expect(result).toEqual(apiKey)
  })

  it('returns undefined when api key creation fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Forbidden',
      })),
    )

    const result = await createApiKey('Key', setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: undefined,
      errorCall: ['Error: Forbidden'],
    })
  })

  it('loads api keys', async () => {
    const setError = vi.fn()
    const key = {
      id: 'key-1',
      name: 'Key',
      created_at: '2026-06-03T12:00:00.000Z',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({keys: [key]}),
      })),
    )

    const result = await listApiKeys(setError)

    expect(result).toEqual([key])
  })

  it('returns no api keys when loading fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unavailable',
      })),
    )

    const result = await listApiKeys(setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: [],
      errorCall: ['Error: Unavailable'],
    })
  })

  it('revokes an api key', async () => {
    const setError = vi.fn()
    vi.stubGlobal('fetch', vi.fn(async () => ({ok: true})))

    const result = await revokeApiKey('key-1', setError)

    expect(result).toBe(true)
  })

  it('returns false when api key revoke fails', async () => {
    const setError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Not Found',
      })),
    )

    const result = await revokeApiKey('key-1', setError)

    expect({result, errorCall: setError.mock.calls[0]}).toEqual({
      result: false,
      errorCall: ['Error: Not Found'],
    })
  })
})
