import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'

const serviceMocks = vi.hoisted(() => ({
  getAvgRating: vi.fn(),
  getSalesStats: vi.fn(),
  getStarDistribution: vi.fn(),
}))

vi.mock('../analytics/service.js', () => ({
  AnalyticsService: vi.fn(() => serviceMocks),
}))

function response() {
  const res = {
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('analytics router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the authenticated seller average rating', async () => {
    const {getAvgRating} = await import('../analytics/router.js')
    serviceMocks.getAvgRating.mockResolvedValue(4.5)
    const req = {
      sessionToken: 'session-token',
      user: {id: 'seller-1'},
    } as Request
    const res = response()

    await getAvgRating(req, res)

    expect({
      serviceCall: serviceMocks.getAvgRating.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['seller-1'],
      jsonCall: [{averageRating: 4.5}],
    })
  })

  it('rejects average rating requests without a session token', async () => {
    const {getAvgRating} = await import('../analytics/router.js')
    const req = {
      user: {id: 'seller-1'},
    } as Request
    const res = response()

    await getAvgRating(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })

  it('gets the authenticated seller star distribution', async () => {
    const {getStarDistribution} = await import('../analytics/router.js')
    serviceMocks.getStarDistribution.mockResolvedValue([1, 2, 3, 4, 5])
    const req = {
      sessionToken: 'session-token',
      user: {id: 'seller-1'},
    } as Request
    const res = response()

    await getStarDistribution(req, res)

    expect({
      serviceCall: serviceMocks.getStarDistribution.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['seller-1'],
      jsonCall: [{ratings: [1, 2, 3, 4, 5]}],
    })
  })

  it('rejects star distribution requests without a user', async () => {
    const {getStarDistribution} = await import('../analytics/router.js')
    const req = {
      sessionToken: 'session-token',
    } as Request
    const res = response()

    await getStarDistribution(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })

  it('gets the authenticated seller sales stats', async () => {
    const {getSalesStats} = await import('../analytics/router.js')
    serviceMocks.getSalesStats.mockResolvedValue([
      {month: 'Jun 2026', earnings: 42.5, orders: 2},
    ])
    const req = {
      sessionToken: 'session-token',
      user: {id: 'seller-1'},
    } as Request
    const res = response()

    await getSalesStats(req, res)

    expect({
      serviceCall: serviceMocks.getSalesStats.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: ['seller-1'],
      jsonCall: [{
        salesStats: [{month: 'Jun 2026', earnings: 42.5, orders: 2}],
      }],
    })
  })

  it('rejects sales stats requests without a session token', async () => {
    const {getSalesStats} = await import('../analytics/router.js')
    const req = {
      user: {id: 'seller-1'},
    } as Request
    const res = response()

    await getSalesStats(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })
})
