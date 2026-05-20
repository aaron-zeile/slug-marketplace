import {describe, expect, it, vi} from 'vitest'

import {create, list, remove} from '../dashboard/model'

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  created_at: '2025-07-18T23:28:50.000Z',
  images: [],
  status: 'active'
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
})
