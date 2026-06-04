import type {Request, Response} from 'express'
import {beforeEach, describe, expect, it, vi} from 'vitest'

const serviceMock = vi.hoisted(() => ({
  getOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}))

vi.mock('../orders/service.js', () => ({
  OrderService: vi.fn(() => serviceMock),
}))

const sellerId = '7b355067-1dee-4b9a-a87a-fa745332ecf8'

const order = {
  id: 'order-1',
  buyer: 'buyer-1',
  items: [{itemId: 'item-1', sellerId}],
  orderedAt: '2026-05-11T12:00:00.000Z',
  purchaseAmount: 24.99,
  status: 'ordered',
  address: {
    line1: '1156 High Street',
    line2: '',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
}

function response() {
  const res = {
    json: vi.fn(() => res),
    sendStatus: vi.fn(() => res),
    status: vi.fn(() => res),
  }

  return res as unknown as Response
}

describe('orders router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets orders for the authenticated seller', async () => {
    const {get} = await import('../orders/router.js')
    serviceMock.getOrders.mockResolvedValue([order])
    const req = {
      user: {
        id: sellerId,
      },
    } as Request
    const res = response()

    await get(req, res)

    expect({
      serviceCall: serviceMock.getOrders.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: [sellerId],
      jsonCall: [{orders: [order]}],
    })
  })

  it('rejects order requests without an authenticated user', async () => {
    const {get} = await import('../orders/router.js')
    const req = {} as Request
    const res = response()

    await get(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })

  it('updates an order status for the authenticated seller', async () => {
    const {patchStatus} = await import('../orders/router.js')
    serviceMock.updateOrderStatus.mockResolvedValue({...order, status: 'shipping'})
    const req = {
      body: {status: 'shipping'},
      params: {orderId: order.id},
      user: {
        id: sellerId,
      },
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect({
      serviceCall: serviceMock.updateOrderStatus.mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      serviceCall: [sellerId, order.id, 'shipping'],
      jsonCall: [{order: {...order, status: 'shipping'}}],
    })
  })

  it('rejects status updates without an authenticated seller', async () => {
    const {patchStatus} = await import('../orders/router.js')
    const req = {
      body: {status: 'shipping'},
      params: {orderId: order.id},
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect((res.sendStatus as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
      401,
    ])
  })

  it('rejects status updates without an order id', async () => {
    const {patchStatus} = await import('../orders/router.js')
    const req = {
      body: {status: 'shipping'},
      params: {},
      user: {
        id: sellerId,
      },
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect({
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      statusCall: [400],
      jsonCall: [{error: 'Order id is required'}],
    })
  })

  it('rejects invalid order status updates', async () => {
    const {patchStatus} = await import('../orders/router.js')
    const req = {
      body: {status: 'ordered'},
      params: {orderId: order.id},
      user: {
        id: sellerId,
      },
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect({
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      statusCall: [400],
      jsonCall: [{error: 'status must be shipping or delivered'}],
    })
  })

  it('returns service errors from status updates', async () => {
    const {patchStatus} = await import('../orders/router.js')
    serviceMock.updateOrderStatus.mockRejectedValue(new Error('Invalid transition'))
    const req = {
      body: {status: 'shipping'},
      params: {orderId: order.id},
      user: {
        id: sellerId,
      },
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect({
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      statusCall: [400],
      jsonCall: [{error: 'Invalid transition'}],
    })
  })

  it('returns a fallback message for non-error status update failures', async () => {
    const {patchStatus} = await import('../orders/router.js')
    serviceMock.updateOrderStatus.mockRejectedValue('not an error')
    const req = {
      body: {status: 'shipping'},
      params: {orderId: order.id},
      user: {
        id: sellerId,
      },
    } as unknown as Request
    const res = response()

    await patchStatus(req, res)

    expect({
      statusCall: (res.status as ReturnType<typeof vi.fn>).mock.calls[0],
      jsonCall: (res.json as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      statusCall: [400],
      jsonCall: [{error: 'Could not update order'}],
    })
  })
})
