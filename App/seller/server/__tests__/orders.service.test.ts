import {afterEach, describe, expect, it, vi} from 'vitest'

const sellerId = '7b355067-1dee-4b9a-a87a-fa745332ecf8'

const order = {
  id: '44444444-4444-4444-8444-444444444444',
  buyer: '33333333-3333-4333-8333-333333333333',
  items: [{itemId: 'item-1', sellerId}],
  orderedAt: '2026-05-11T12:00:00.000Z',
  purchaseAmount: 24.99,
  status: 'ordered',
  address: {
    label: 'Home',
    line1: '1156 High Street',
    line2: '',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
}

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
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete process.env.ORDER_SERVICE_URL
  })

  it('fetches seller orders through GraphQL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          sellerOrders: [order],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    const orders = await new OrderService().getOrders(sellerId)

    expect({
      orders,
      request: fetchMock.mock.calls[0],
    }).toEqual({
      orders: [order],
      request: [
        'http://orders.test/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: expect.stringContaining(`"seller":"${sellerId}"`),
        }),
      ],
    })
  })

  it('accepts GraphQL uppercase status enum values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            sellerOrders: [{...order, status: 'ORDERED'}],
          },
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    const orders = await new OrderService().getOrders(sellerId)

    expect(orders[0]?.status).toBe('ordered')
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
    const OrderService = await importFreshOrderService()

    const orders = await new OrderService().getOrders(sellerId)

    expect({
      orders,
      url: fetchMock.mock.calls[0]?.[0],
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
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getOrders(sellerId)).rejects.toThrow(
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
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getOrders(sellerId)).rejects.toThrow(
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
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getOrders(sellerId)).rejects.toThrow(
      'GraphQL error',
    )
  })

  it('throws when the seller orders response does not match the schema', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
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
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getOrders(sellerId)).rejects.toThrow(
      'Seller orders response did not match expected schema',
    )
  })

  it('updates an order status through GraphQL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updateOrderStatus: {...order, status: 'SHIPPING'},
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    const updated = await new OrderService().updateOrderStatus(
      sellerId,
      order.id,
      'shipping',
    )

    expect({
      updated,
      requestBody: JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)),
    }).toEqual({
      updated: {...order, status: 'shipping'},
      requestBody: expect.objectContaining({
        variables: {
          input: {
            orderId: order.id,
            seller: sellerId,
            status: 'SHIPPING',
          },
        },
      }),
    })
  })

  it('fetches seller sales stats through GraphQL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          sellerSalesStats: [
            {month: 'Jun 2026', earnings: 42.5, orders: 2},
          ],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    const stats = await new OrderService().getSalesStats(sellerId)

    expect({
      stats,
      request: fetchMock.mock.calls[0],
    }).toEqual({
      stats: [{month: 'Jun 2026', earnings: 42.5, orders: 2}],
      request: [
        'http://orders.test/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: expect.stringContaining('sellerSalesStats'),
        }),
      ],
    })
  })

  it('throws when seller sales stats receive a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getSalesStats(sellerId)).rejects.toThrow(
      'Failed to fetch seller sales stats: Bad Gateway',
    )
  })

  it('throws graphql errors from seller sales stats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{message: 'Stats query failed'}],
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getSalesStats(sellerId)).rejects.toThrow(
      'Stats query failed',
    )
  })

  it('throws fallback graphql errors from seller sales stats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{}],
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getSalesStats(sellerId)).rejects.toThrow(
      'GraphQL error',
    )
  })

  it('throws when seller sales stats do not match the schema', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            sellerSalesStats: [{month: 'Jun 2026'}],
          },
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(new OrderService().getSalesStats(sellerId)).rejects.toThrow(
      'Seller sales stats response did not match expected schema',
    )
  })

  it('sends delivered status updates as GraphQL enum values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updateOrderStatus: {...order, status: 'DELIVERED'},
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    const updated = await new OrderService().updateOrderStatus(
      sellerId,
      order.id,
      'delivered',
    )

    expect({
      status: updated.status,
      requestBody: JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)),
    }).toEqual({
      status: 'delivered',
      requestBody: expect.objectContaining({
        variables: {
          input: {
            orderId: order.id,
            seller: sellerId,
            status: 'DELIVERED',
          },
        },
      }),
    })
  })

  it('throws when the update order status response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Conflict',
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(
      new OrderService().updateOrderStatus(sellerId, order.id, 'shipping'),
    ).rejects.toThrow('Failed to update order status: Conflict')
  })

  it('throws the graphql error message when update order status fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{message: 'Invalid transition'}],
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(
      new OrderService().updateOrderStatus(sellerId, order.id, 'shipping'),
    ).rejects.toThrow('Invalid transition')
  })

  it('throws the fallback graphql error when update status errors have no message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{}],
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(
      new OrderService().updateOrderStatus(sellerId, order.id, 'shipping'),
    ).rejects.toThrow('GraphQL error')
  })

  it('throws when the updated order response does not match the schema', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            updateOrderStatus: {
              id: 'order-1',
            },
          },
        }),
      }),
    )
    const OrderService = await importFreshOrderService('http://orders.test/graphql')

    await expect(
      new OrderService().updateOrderStatus(sellerId, order.id, 'shipping'),
    ).rejects.toThrow('Updated order response did not match expected schema')
  })
})
