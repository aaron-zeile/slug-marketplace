import {describe, expect, it, vi} from 'vitest'

const expressMocks = vi.hoisted(() => {
  const app = {
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
  const json = vi.fn(() => 'json-middleware')
  const express = vi.fn(() => app)

  return {
    app,
    express,
    json,
  }
})

vi.mock('express', () => ({
  default: Object.assign(expressMocks.express, {
    json: expressMocks.json,
  }),
}))

vi.mock('../auth/middleware.js', () => ({
  doCheck: 'auth-middleware',
}))

vi.mock('../listings/router.js', () => ({
  get: 'get-listings',
  post: 'post-listing',
  remove: 'remove-listing',
}))

describe('seller app', () => {
  it('registers seller listing routes behind auth middleware', async () => {
    const {default: app} = await import('../app.js')

    expect({
      app,
      jsonCalls: expressMocks.json.mock.calls,
      useCalls: expressMocks.app.use.mock.calls,
      getCalls: expressMocks.app.get.mock.calls,
      postCalls: expressMocks.app.post.mock.calls,
      deleteCalls: expressMocks.app.delete.mock.calls,
    }).toEqual({
      app: expressMocks.app,
      jsonCalls: [[]],
      useCalls: [['json-middleware']],
      getCalls: [['/seller/api/listings', 'auth-middleware', 'get-listings']],
      postCalls: [['/seller/api/listings', 'auth-middleware', 'post-listing']],
      deleteCalls: [
        ['/seller/api/listings/:id', 'auth-middleware', 'remove-listing'],
      ],
    })
  })
})
