import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {get, post, remove} from '../listings/router.js'

const serviceMocks = vi.hoisted(() => ({
  getListings: vi.fn(),
  createListing: vi.fn(),
  deleteListing: vi.fn(),
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
  created_at: '2025-07-18 23:28:50+00',
  images: [],
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
    serviceMocks.deleteListing.mockReset()
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

    expect(serviceMocks.getListings).toHaveBeenCalledWith('seller-1', 'active')
    expect(res.json).toHaveBeenCalledWith({
      listings: [listing],
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

    expect(serviceMocks.getListings).toHaveBeenCalledWith('seller-1', 'sold')
  })

  it('rejects listing requests without an authenticated user', async () => {
    const req = {
      query: {},
    } as Request
    const res = response()

    await get(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(401)
    expect(serviceMocks.getListings).not.toHaveBeenCalled()
  })

  it('creates a listing for an authenticated seller session', async () => {
    serviceMocks.createListing.mockResolvedValue(listing)
    const input = {
      name: listing.name,
      description: listing.description,
      price: listing.price,
      images: [],
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

    expect(serviceMocks.createListing).toHaveBeenCalledWith(
      input,
      'session-token',
    )
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      listing,
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

    expect(res.sendStatus).toHaveBeenCalledWith(401)
    expect(serviceMocks.createListing).not.toHaveBeenCalled()
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

    expect(serviceMocks.deleteListing).toHaveBeenCalledWith(
      'item-1',
      'session-token',
    )
    expect(res.sendStatus).toHaveBeenCalledWith(204)
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

    expect(res.sendStatus).toHaveBeenCalledWith(400)
    expect(serviceMocks.deleteListing).not.toHaveBeenCalled()
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

    expect(res.sendStatus).toHaveBeenCalledWith(401)
    expect(serviceMocks.deleteListing).not.toHaveBeenCalled()
  })
})
