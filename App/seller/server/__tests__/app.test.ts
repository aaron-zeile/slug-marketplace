import {beforeAll, describe, expect, it, vi} from 'vitest'

const expressMock = vi.hoisted(() => {
  const app = {
    use: vi.fn(),
  }
  const apiRouter = {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  }
  const json = vi.fn(() => 'json-middleware')
  const express = Object.assign(vi.fn(() => app), {
    json,
    Router: vi.fn(() => apiRouter),
  })

  return {apiRouter, app, express, json}
})

const routeMocks = vi.hoisted(() => ({
  analytics: {
    getAvgRating: vi.fn(),
    getSalesStats: vi.fn(),
    getStarDistribution: vi.fn(),
  },
  apiKeys: {
    get: vi.fn(),
    post: vi.fn(),
    remove: vi.fn(),
  },
  auth: {
    getSession: vi.fn(),
  },
  doCheck: vi.fn(),
  listings: {
    get: vi.fn(),
    getDiscounts: vi.fn(),
    getReviews: vi.fn(),
    post: vi.fn(),
    postDiscount: vi.fn(),
    put: vi.fn(),
    remove: vi.fn(),
  },
  messages: {
    post: vi.fn(),
  },
  orders: {
    get: vi.fn(),
    patchStatus: vi.fn(),
  },
}))

vi.mock('express', () => ({
  default: expressMock.express,
}))

vi.mock('../auth/middleware.js', () => ({
  doCheck: routeMocks.doCheck,
}))

vi.mock('../listings/router.js', () => routeMocks.listings)
vi.mock('../orders/router.js', () => routeMocks.orders)
vi.mock('../apiKeys/router.js', () => routeMocks.apiKeys)
vi.mock('../auth/router.js', () => routeMocks.auth)
vi.mock('../analytics/router.js', () => routeMocks.analytics)
vi.mock('../messages/router.js', () => routeMocks.messages)

interface RouteCase {
  method: keyof typeof expressMock.apiRouter
  path: string
  handler: ReturnType<typeof vi.fn>
}

const routeCases: RouteCase[] = [
  {method: 'get', path: '/listings', handler: routeMocks.listings.get},
  {
    method: 'get',
    path: '/listings/:id/reviews',
    handler: routeMocks.listings.getReviews,
  },
  {
    method: 'get',
    path: '/listings/:id/discounts',
    handler: routeMocks.listings.getDiscounts,
  },
  {method: 'get', path: '/orders', handler: routeMocks.orders.get},
  {method: 'get', path: '/keys', handler: routeMocks.apiKeys.get},
  {
    method: 'patch',
    path: '/orders/:orderId/status',
    handler: routeMocks.orders.patchStatus,
  },
  {method: 'post', path: '/listings', handler: routeMocks.listings.post},
  {
    method: 'post',
    path: '/listings/:id/discounts',
    handler: routeMocks.listings.postDiscount,
  },
  {method: 'put', path: '/listings/:id', handler: routeMocks.listings.put},
  {
    method: 'delete',
    path: '/listings/:id',
    handler: routeMocks.listings.remove,
  },
  {
    method: 'delete',
    path: '/keys/:id',
    handler: routeMocks.apiKeys.remove,
  },
  {method: 'post', path: '/keys', handler: routeMocks.apiKeys.post},
  {method: 'post', path: '/messages', handler: routeMocks.messages.post},
  {method: 'get', path: '/sessions', handler: routeMocks.auth.getSession},
  {
    method: 'get',
    path: '/analytics/average-rating',
    handler: routeMocks.analytics.getAvgRating,
  },
  {
    method: 'get',
    path: '/analytics/star-distribution',
    handler: routeMocks.analytics.getStarDistribution,
  },
  {
    method: 'get',
    path: '/analytics/sales-stats',
    handler: routeMocks.analytics.getSalesStats,
  },
]

describe('seller app', () => {
  beforeAll(async () => {
    await import('../app.js')
  })

  it('mounts json middleware and both seller API prefixes', () => {
    expect({
      jsonCalls: expressMock.json.mock.calls,
      useCalls: expressMock.app.use.mock.calls,
    }).toEqual({
      jsonCalls: [[]],
      useCalls: [
        ['json-middleware'],
        ['/seller/api', expressMock.apiRouter],
        ['/api', expressMock.apiRouter],
      ],
    })
  })

  it.each(routeCases)(
    'registers $method $path behind auth middleware',
    ({method, path, handler}) => {
      expect(expressMock.apiRouter[method]).toHaveBeenCalledWith(
        path,
        routeMocks.doCheck,
        handler,
      )
    },
  )
})
