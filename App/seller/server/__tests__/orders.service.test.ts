import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type {OrderService as SellerOrderService} from '../orders/service.js'
import {
  resetOrderDatabase,
  seedSellerOrders,
  sellerId,
  startOrderGraphqlServer,
  stopOrderGraphqlServer,
} from './orderTestServer'

let OrderService: typeof SellerOrderService
let orderServiceUrl: string

async function importFreshOrderService(url?: string) {
  vi.resetModules()
  if (url === undefined) {
    delete process.env.ORDER_SERVICE_URL
  } else {
    process.env.ORDER_SERVICE_URL = url
  }

  const serviceModule = await import('../orders/service.js')
  return serviceModule.OrderService
}

describe('OrderService', () => {
  beforeAll(async () => {
    orderServiceUrl = await startOrderGraphqlServer()
    process.env.ORDER_SERVICE_URL = orderServiceUrl
    ;({OrderService} = await import('../orders/service.js'))
  })

  beforeEach(async () => {
    await resetOrderDatabase()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env.ORDER_SERVICE_URL = orderServiceUrl
  })

  afterAll(async () => {
    await stopOrderGraphqlServer()
  })

  it('fetches seller orders from the real order database through GraphQL', async () => {
    const seeded = await seedSellerOrders()

    const orders = await new OrderService().getOrders(sellerId)

    expect(orders).toEqual([
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
    ])
  })

  it('uses the default order service URL when no environment override is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          sellerOrders: [],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const FreshOrderService = await importFreshOrderService()

    const orders = await new FreshOrderService().getOrders(sellerId)

    expect({
      orders,
      url: fetchMock.mock.calls[0][0],
    }).toEqual({
      orders: [],
      url: 'http://localhost:4700/graphql',
    })
  })

  it('throws when the order service response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
      }),
    )
    const FreshOrderService = await importFreshOrderService(orderServiceUrl)

    await expect(new FreshOrderService().getOrders(sellerId)).rejects.toThrow(
      'Failed to fetch seller orders: Bad Gateway',
    )
  })

  it('throws the graphql error message when seller orders fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [
            {
              message: 'Seller not found',
            },
          ],
        }),
      }),
    )
    const FreshOrderService = await importFreshOrderService(orderServiceUrl)

    await expect(new FreshOrderService().getOrders(sellerId)).rejects.toThrow(
      'Seller not found',
    )
  })

  it('throws the fallback graphql error when seller order errors have no message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{}],
        }),
      }),
    )
    const FreshOrderService = await importFreshOrderService(orderServiceUrl)

    await expect(new FreshOrderService().getOrders(sellerId)).rejects.toThrow(
      'GraphQL error',
    )
  })

  it('throws when the seller orders response does not match the schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            sellerOrders: [
              {
                id: 'order-1',
              },
            ],
          },
        }),
      }),
    )
    const FreshOrderService = await importFreshOrderService(orderServiceUrl)

    await expect(new FreshOrderService().getOrders(sellerId)).rejects.toThrow(
      'Seller orders response did not match expected schema',
    )
  })
})
