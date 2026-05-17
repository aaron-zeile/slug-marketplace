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

    expect(app).toBe(expressMocks.app)
    expect(expressMocks.json).toHaveBeenCalledOnce()
    expect(expressMocks.app.use).toHaveBeenCalledWith('json-middleware')
    expect(expressMocks.app.get).toHaveBeenCalledWith(
      '/seller/api/listings',
      'auth-middleware',
      'get-listings',
    )
    expect(expressMocks.app.post).toHaveBeenCalledWith(
      '/seller/api/listings',
      'auth-middleware',
      'post-listing',
    )
    expect(expressMocks.app.delete).toHaveBeenCalledWith(
      '/seller/api/listings/:id',
      'auth-middleware',
      'remove-listing',
    )
  })
})
