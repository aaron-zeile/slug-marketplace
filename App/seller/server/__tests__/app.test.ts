import {describe, expect, it, vi} from 'vitest'

vi.mock('../auth/middleware.js', () => ({
  doCheck: (
    _req: unknown,
    _res: unknown,
    next: (...args: unknown[]) => void,
  ) => next(),
}))

vi.mock('../listings/router.js', () => ({
  get: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'get-listings'}),
  getReviews: (
    req: {params: {id: string}},
    res: {json: (body: unknown) => void},
  ) => res.json({route: 'get-listing-reviews', id: req.params.id}),
  post: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'post-listing'}),
  put: (
    req: {params: {id: string}},
    res: {json: (body: unknown) => void},
  ) => res.json({route: 'put-listing', id: req.params.id}),
  remove: (
    req: {params: {id: string}},
    res: {json: (body: unknown) => void},
  ) => res.json({route: 'remove-listing', id: req.params.id}),
}))

vi.mock('../orders/router.js', () => ({
  get: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'get-orders'}),
}))

vi.mock('../apiKeys/router.js', () => ({
  post: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'post-api-key'}),
}))

vi.mock('../auth/router.js', () => ({
  getSession: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'get-session'}),
}))

vi.mock('../messages/router.js', () => ({
  post: (_req: unknown, res: {json: (body: unknown) => void}) =>
    res.json({route: 'post-message'}),
}))

interface RouteCase {
  method: 'get' | 'post' | 'put' | 'delete'
  path: string
  expected: Record<string, unknown>
}

const routeCases: RouteCase[] = [
  {method: 'get', path: '/api/listings', expected: {route: 'get-listings'}},
  {
    method: 'get',
    path: '/api/listings/abc/reviews',
    expected: {route: 'get-listing-reviews', id: 'abc'},
  },
  {method: 'get', path: '/api/orders', expected: {route: 'get-orders'}},
  {method: 'get', path: '/api/sessions', expected: {route: 'get-session'}},
  {method: 'post', path: '/api/listings', expected: {route: 'post-listing'}},
  {method: 'post', path: '/api/keys', expected: {route: 'post-api-key'}},
  {method: 'post', path: '/api/messages', expected: {route: 'post-message'}},
  {
    method: 'put',
    path: '/api/listings/abc',
    expected: {route: 'put-listing', id: 'abc'},
  },
  {
    method: 'delete',
    path: '/api/listings/abc',
    expected: {route: 'remove-listing', id: 'abc'},
  },
]

async function callRoute(
  app: import('express').Express,
  method: RouteCase['method'],
  path: string,
): Promise<{status: number; body: unknown}> {
  const {createServer} = await import('node:http')
  const server = createServer(app)
  await new Promise<void>((resolve) => {
    server.listen(0, resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    server.close()
    throw new Error('Failed to start test server')
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:${String(address.port)}${path}`,
      {method: method.toUpperCase()},
    )
    const body = (await response.json()) as unknown
    return {status: response.status, body}
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve()
      })
    })
  }
}

describe('seller app', () => {
  it.each(routeCases)(
    'mounts $method $path at both /seller/api and /api prefixes',
    async ({method, path, expected}) => {
      const {default: app} = await import('../app.js')

      const prefixed = await callRoute(app, method, `/seller${path}`)
      expect(prefixed.status).toBe(200)
      expect(prefixed.body).toEqual(expected)

      const stripped = await callRoute(app, method, path)
      expect(stripped.status).toBe(200)
      expect(stripped.body).toEqual(expected)
    },
  )
})
