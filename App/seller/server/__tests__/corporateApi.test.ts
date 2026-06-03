import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {doCheck} from '../auth/middleware.js'
import {check, checkApiKey, createApiKey} from '../auth/service.js'
import * as apiKeys from '../apiKeys/router.js'
import {ListingService} from '../listings/service.js'
import * as listings from '../listings/router.js'

vi.mock('../auth/service.js', () => ({
  check: vi.fn(),
  checkApiKey: vi.fn(),
  createApiKey: vi.fn(),
}))

vi.mock('../listings/service.js', () => ({
  ListingService: vi.fn(),
}))

const mockCheck = vi.mocked(check)
const mockCheckApiKey = vi.mocked(checkApiKey)
const mockCreateApiKey = vi.mocked(createApiKey)
const MockListingService = vi.mocked(ListingService)

const sellerUser = {
  id: 'seller-123',
  email: 'seller@example.com',
  name: 'Seller Name',
}

const corporateAuth = {
  ...sellerUser,
  token: 'forwarded-session-token',
}

const listing = {
  id: 'item-123',
  seller: {
    id: sellerUser.id,
    name: sellerUser.name,
  },
  name: 'Corporate Listing',
  description: 'Created through the REST API',
  price: 19.99,
  quantity: 1,
  created_at: '2026-05-17T00:00:00.000Z',
  images: ['https://example.com/image.jpg'],
  status: 'active',
}

function response() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
  }

  return res as unknown as Response
}

async function runWithAuth(
  req: Request,
  res: Response,
  handler: (req: Request, res: Response) => Promise<void>,
) {
  await doCheck(req, res, async () => {
    await handler(req, res)
  })
}

describe('seller corporate REST API', () => {
  const getListings = vi.fn()
  const createListing = vi.fn()
  const deleteListing = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    getListings.mockResolvedValue([listing])
    createListing.mockResolvedValue(listing)
    deleteListing.mockResolvedValue(undefined)
    MockListingService.mockImplementation(() => ({
      getListings,
      createListing,
      deleteListing,
    } as unknown as ListingService))
  })

  it('rejects listing requests without browser auth or a corporate API key', async () => {
    const req = {
      headers: {},
      query: {status: 'active'},
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, listings.get)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      listingCalls: getListings.mock.calls,
    }).toEqual({
      statusCall: [401],
      listingCalls: [],
    })
  })

  it('gets seller listings with a corporate API key', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth)
    const req = {
      headers: {'x-api-key': 'slug_sk_test'},
      query: {status: 'sold'},
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, listings.get)

    expect({
      checkCall: mockCheckApiKey.mock.calls[0],
      listingCall: getListings.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      checkCall: ['slug_sk_test'],
      listingCall: [sellerUser.id, 'sold'],
      jsonCall: [{listings: [listing]}],
    })
  })

  it('creates a listing with a corporate API key and forwards the session token to ItemsService', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth)
    const input = {
      name: 'Corporate Listing',
      description: 'Created through the REST API',
      price: 19.99,
      quantity: 1,
      images: ['https://example.com/image.jpg'],
    }
    const req = {
      headers: {'x-api-key': 'slug_sk_test'},
      body: input,
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, listings.post)

    expect({
      createCall: createListing.mock.calls[0],
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      createCall: [input, corporateAuth.token],
      statusCall: [201],
      jsonCall: [{listing}],
    })
  })

  it('deletes a listing with a corporate API key and forwards the session token to ItemsService', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth)
    const req = {
      headers: {'x-api-key': 'slug_sk_test'},
      params: {id: 'item-123'},
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, listings.remove)

    expect({
      deleteCall: deleteListing.mock.calls[0],
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      deleteCall: ['item-123', corporateAuth.token],
      statusCall: [204],
    })
  })

  it('rejects an invalid corporate API key', async () => {
    mockCheckApiKey.mockResolvedValue(undefined)
    const req = {
      headers: {'x-api-key': 'slug_sk_bad'},
      query: {},
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, listings.get)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      listingCalls: getListings.mock.calls,
    }).toEqual({
      statusCall: [401],
      listingCalls: [],
    })
  })

  it('creates a corporate API key for a browser-authenticated seller session', async () => {
    mockCheck.mockResolvedValue(sellerUser)
    mockCreateApiKey.mockResolvedValue({
      id: 'key-123',
      name: 'Bulk uploader',
      key: 'slug_sk_created',
      created_at: '2026-05-17T00:00:00.000Z',
    })
    const req = {
      headers: {cookie: 'session=browser-session-token'},
      body: {name: 'Bulk uploader'},
    } as unknown as Request
    const res = response()

    await runWithAuth(req, res, apiKeys.post)

    expect({
      checkCall: mockCheck.mock.calls[0],
      createKeyCall: mockCreateApiKey.mock.calls[0],
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      checkCall: ['browser-session-token'],
      createKeyCall: ['browser-session-token', 'Bulk uploader'],
      statusCall: [201],
      jsonCall: [{
        id: 'key-123',
        name: 'Bulk uploader',
        key: 'slug_sk_created',
        created_at: '2026-05-17T00:00:00.000Z',
      }],
    })
  })
})
