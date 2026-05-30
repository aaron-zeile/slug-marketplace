import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {get, getReviews, post, put, remove} from '../listings/router.js'

const serviceMocks = vi.hoisted(() => ({
  getListings: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: vi.fn(),
  getReviews: vi.fn(),
}))

vi.mock('../listings/service.js', () => ({
  ListingService: vi.fn(() => serviceMocks),
}))

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A helpful little hub.',
  price: 24.99,
  quantity: 1,
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

function response() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('listings router', () => {
  beforeEach(() => {
    serviceMocks.getListings.mockReset()
    serviceMocks.createListing.mockReset()
    serviceMocks.updateListing.mockReset()
    serviceMocks.deleteListing.mockReset()
    serviceMocks.getReviews.mockReset()
  })

  it('gets active listings for the authenticated seller by default', async () => {
    serviceMocks.getListings.mockResolvedValue([listing])
    const req = {
      user: {
        id: 'seller-1',
      },
      query: {},
    } as Request
    const res = response()

    await get(req, res)

    expect({
      serviceCall: serviceMocks.getListings.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['seller-1', 'active'],
      jsonCall: [{listings: [listing]}],
    })
  })

  it('gets sold listings when requested', async () => {
    serviceMocks.getListings.mockResolvedValue([listing])
    const req = {
      user: {
        id: 'seller-1',
      },
      query: {
        status: 'sold',
      },
    } as unknown as Request
    const res = response()

    await get(req, res)

    expect(serviceMocks.getListings.mock.calls[0]).toEqual(['seller-1', 'sold'])
  })

  it('rejects listing requests without an authenticated user', async () => {
    const req = {
      query: {},
    } as Request
    const res = response()

    await get(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.getListings.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })

  it('creates a listing for an authenticated seller session', async () => {
    serviceMocks.createListing.mockResolvedValue(listing)
    const input = {
      name: listing.name,
      description: listing.description,
      price: listing.price,
      images: [],
      quantity: listing.quantity,
    }
    const req = {
      user: {
        id: 'seller-1',
      },
      sessionToken: 'session-token',
      body: input,
    } as Request
    const res = response()

    await post(req, res)

    expect({
      serviceCall: serviceMocks.createListing.mock.calls[0],
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: [input, 'session-token'],
      statusCall: [201],
      jsonCall: [{listing}],
    })
  })

  it('rejects create listing requests without a session token', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      body: {},
    } as Request
    const res = response()

    await post(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.createListing.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })

  it('updates a listing for an authenticated seller session', async () => {
    serviceMocks.updateListing.mockResolvedValue(listing)
    const input = {
      name: listing.name,
      description: listing.description,
      price: listing.price,
      images: [],
      quantity: listing.quantity,
    }
    const req = {
      user: {
        id: 'seller-1',
      },
      sessionToken: 'session-token',
      params: {
        id: 'item-1',
      },
      body: input,
    } as unknown as Request
    const res = response()

    await put(req, res)

    expect({
      serviceCall: serviceMocks.updateListing.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['item-1', input, 'session-token'],
      jsonCall: [{listing}],
    })
  })

  it('rejects update listing requests without a session token', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      params: {
        id: 'item-1',
      },
      body: {},
    } as unknown as Request
    const res = response()

    await put(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.updateListing.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })

  it('rejects update listing requests without an item id', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      sessionToken: 'session-token',
      params: {},
      body: {},
    } as Request
    const res = response()

    await put(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.updateListing.mock.calls,
    }).toEqual({
      statusCall: [400],
      serviceCalls: [],
    })
  })

  it('gets reviews for an authenticated seller listing', async () => {
    serviceMocks.getReviews.mockResolvedValue([review])
    const req = {
      user: {
        id: 'seller-1',
      },
      params: {
        id: 'item-1',
      },
    } as unknown as Request
    const res = response()

    await getReviews(req, res)

    expect({
      serviceCall: serviceMocks.getReviews.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['item-1'],
      jsonCall: [{reviews: [review]}],
    })
  })

  it('rejects review requests without an authenticated user', async () => {
    const req = {
      params: {
        id: 'item-1',
      },
    } as unknown as Request
    const res = response()

    await getReviews(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.getReviews.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })

  it('rejects review requests without an item id', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      params: {},
    } as Request
    const res = response()

    await getReviews(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.getReviews.mock.calls,
    }).toEqual({
      statusCall: [400],
      serviceCalls: [],
    })
  })

  it('deletes a listing for an authenticated seller session', async () => {
    serviceMocks.deleteListing.mockResolvedValue(undefined)
    const req = {
      user: {
        id: 'seller-1',
      },
      sessionToken: 'session-token',
      params: {
        id: 'item-1',
      },
    } as unknown as Request
    const res = response()

    await remove(req, res)

    expect({
      serviceCall: serviceMocks.deleteListing.mock.calls[0],
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['item-1', 'session-token'],
      statusCall: [204],
    })
  })

  it('rejects delete listing requests without an item id', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      sessionToken: 'session-token',
      params: {},
    } as Request
    const res = response()

    await remove(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.deleteListing.mock.calls,
    }).toEqual({
      statusCall: [400],
      serviceCalls: [],
    })
  })

  it('rejects delete listing requests without a session token', async () => {
    const req = {
      user: {
        id: 'seller-1',
      },
      params: {
        id: 'item-1',
      },
    } as unknown as Request
    const res = response()

    await remove(req, res)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      serviceCalls: serviceMocks.deleteListing.mock.calls,
    }).toEqual({
      statusCall: [401],
      serviceCalls: [],
    })
  })
})
