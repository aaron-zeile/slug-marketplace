import type {Request, Response} from 'express'
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import type {get as getOrders} from '../orders/router.js'
import {
  resetOrderDatabase,
  seedSellerOrders,
  sellerId,
  startOrderGraphqlServer,
  stopOrderGraphqlServer,
} from './orderTestServer'

let get: typeof getOrders

function response() {
  const res = {
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('orders router', () => {
  beforeAll(async () => {
    process.env.ORDER_SERVICE_URL = await startOrderGraphqlServer()
    ;({get} = await import('../orders/router.js'))
  })

  beforeEach(async () => {
    await resetOrderDatabase()
  })

  afterAll(async () => {
    await stopOrderGraphqlServer()
  })

  it('gets orders for the authenticated seller from the real order database', async () => {
    const seeded = await seedSellerOrders()
    const req = {
      user: {
        id: sellerId,
      },
    } as Request
    const res = response()

    await get(req, res)

    expect((res.json as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      {
        orders: [
          expect.objectContaining({
            id: seeded.id,
            buyer: seeded.buyer,
            items: [
              {
                itemId: seeded.items[0].itemId,
                sellerId,
              },
            ],
            purchaseAmount: seeded.purchaseAmount,
            address: expect.objectContaining(seeded.address),
          }),
        ],
      },
    ])
  })

  it('rejects order requests without an authenticated user', async () => {
    const req = {} as Request
    const res = response()

    await get(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })
})
