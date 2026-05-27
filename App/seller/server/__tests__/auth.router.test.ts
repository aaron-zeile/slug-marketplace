import type {Request, Response} from 'express'
import {describe, expect, it, vi} from 'vitest'
import {getSession} from '../auth/router.js'

function response() {
  const res = {
    json: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('auth router', () => {
  it('returns the authenticated session user', async () => {
    const user = {
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Test Seller',
    }
    const req = {
      user,
    } as Request
    const res = response()

    await getSession(req, res)

    expect((res.json as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      {user},
    ])
  })

  it('returns an empty user field when middleware has not set a user', async () => {
    const req = {} as Request
    const res = response()

    await getSession(req, res)

    expect((res.json as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      {user: undefined},
    ])
  })
})
