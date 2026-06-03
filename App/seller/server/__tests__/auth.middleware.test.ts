import type {Request, Response} from 'express'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {doCheck} from '../auth/middleware.js'

const authMocks = vi.hoisted(() => ({
  check: vi.fn(),
  checkApiKey: vi.fn(),
}))

vi.mock('../auth/service.js', () => ({
  check: authMocks.check,
  checkApiKey: authMocks.checkApiKey,
}))

function response() {
  const res = {
    sendStatus: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('doCheck', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    authMocks.check.mockReset()
    authMocks.checkApiKey.mockReset()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('rejects requests without a session cookie in development', async () => {
    process.env.NODE_ENV = 'development'
    const req = {
      headers: {},
    } as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      nextCalls: next.mock.calls,
      checkCalls: authMocks.check.mock.calls,
    }).toEqual({
      statusCall: [401],
      nextCalls: [],
      checkCalls: [],
    })
  })

  it('rejects requests without a session cookie outside development', async () => {
    process.env.NODE_ENV = 'production'
    const req = {
      headers: {},
    } as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      nextCalls: next.mock.calls,
    }).toEqual({
      statusCall: [401],
      nextCalls: [],
    })
  })

  it('sets the authenticated user and session token from login check', async () => {
    process.env.NODE_ENV = 'production'
    authMocks.check.mockResolvedValue({
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Test Seller',
    })
    const req = {
      headers: {
        cookie: 'other=value; session=session-token',
      },
    } as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      checkCall: authMocks.check.mock.calls[0],
      sessionToken: req.sessionToken,
      user: req.user,
      nextCalls: next.mock.calls.length,
    }).toEqual({
      checkCall: ['session-token'],
      sessionToken: 'session-token',
      user: {
        id: 'seller-1',
        email: 'seller@example.com',
        name: 'Test Seller',
      },
      nextCalls: 1,
    })
  })

  it('sets the authenticated user and session token from x-api-key', async () => {
    authMocks.checkApiKey.mockResolvedValue({
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Corporate Seller',
      token: 'forwarded-session-token',
    })
    const req = {
      headers: {
        'x-api-key': 'slug_sk_test',
      },
    } as unknown as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      checkApiKeyCall: authMocks.checkApiKey.mock.calls[0],
      sessionToken: req.sessionToken,
      user: req.user,
      nextCalls: next.mock.calls.length,
    }).toEqual({
      checkApiKeyCall: ['slug_sk_test'],
      sessionToken: 'forwarded-session-token',
      user: {
        id: 'seller-1',
        email: 'seller@example.com',
        name: 'Corporate Seller',
      },
      nextCalls: 1,
    })
  })

  it('does not treat Authorization bearer tokens as seller API keys', async () => {
    const req = {
      headers: {
        authorization: 'Bearer slug_sk_test',
      },
    } as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      checkApiKeyCalls: authMocks.checkApiKey.mock.calls,
      nextCalls: next.mock.calls,
    }).toEqual({
      statusCall: [401],
      checkApiKeyCalls: [],
      nextCalls: [],
    })
  })

  it('rejects requests when login check does not return a user', async () => {
    process.env.NODE_ENV = 'production'
    authMocks.check.mockResolvedValue(undefined)
    const req = {
      headers: {
        cookie: 'session=session-token',
      },
    } as Request
    const res = response()
    const next = vi.fn()

    await doCheck(req, res, next)

    expect({
      checkCall: authMocks.check.mock.calls[0],
      statusCall: (res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0],
      nextCalls: next.mock.calls,
    }).toEqual({
      checkCall: ['session-token'],
      statusCall: [401],
      nextCalls: [],
    })
  })
})
