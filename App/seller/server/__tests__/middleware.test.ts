import type {NextFunction, Request, Response} from 'express'
import {describe, expect, it, vi} from 'vitest'
import {z} from 'zod'
import {validate} from '../middleware.js'

function response() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('validate', () => {
  const schema = z.object({
    body: z.object({
      name: z.string(),
    }),
    query: z.object({}),
    params: z.object({}),
  })

  it('continues when the request matches the schema', () => {
    const req = {
      body: {
        name: 'USB Hub',
      },
      query: {},
      params: {},
    } as Request
    const res = response()
    const next: NextFunction = vi.fn()

    validate(schema)(req, res, next)

    expect({
      nextCalls: (next as ReturnType<typeof vi.fn>).mock.calls.length,
      statusCalls: (res.status as ReturnType<typeof vi.fn>).mock.calls,
    }).toEqual({
      nextCalls: 1,
      statusCalls: [],
    })
  })

  it('returns a 400 when validation fails', () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as Request
    const res = response()
    const next: NextFunction = vi.fn()

    validate(schema)(req, res, next)

    expect({
      nextCalls: (next as ReturnType<typeof vi.fn>).mock.calls,
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonError: (res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0],
    }).toEqual({
      nextCalls: [],
      statusCall: [400],
      jsonError: expect.any(z.ZodError),
    })
  })
})
