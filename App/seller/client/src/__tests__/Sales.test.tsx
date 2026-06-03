import {screen} from '@testing-library/react'
import React from 'react'
import {describe, expect, it, vi} from 'vitest'

import Sales from '../dashboard/Sales'
import {renderWithProviders} from '../test/renderWithProviders'

const order = {
  id: 'order-1234567890',
  buyer: 'buyer-1',
  items: [
    {
      itemId: 'item-1',
      sellerId: 'seller-1',
    },
    {
      itemId: 'item-2',
      sellerId: 'seller-1',
    },
  ],
  orderedAt: '2026-05-20T12:34:00.000Z',
  purchaseAmount: 42.5,
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

describe('Sales', () => {
  it('renders order grid cells with formatted values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          orders: [order],
        }),
      })),
    )

    renderWithProviders(<Sales />)

    await screen.findByText(order.id)

    const formattedDate = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(order.orderedAt))
    const formattedAmount = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
    }).format(order.purchaseAmount)

    expect({
      orderIdVisible: screen.queryByText(order.id) !== null,
      dateVisible: screen.queryByText(formattedDate) !== null,
      itemCountVisible: screen.queryByText('2') !== null,
      amountVisible: screen.queryByText(formattedAmount) !== null,
      addressVisible:
        screen.queryByText('1156 High Street, Santa Cruz, CA, 95064, US') !==
        null,
      emptyLineOmitted:
        screen.queryByText(/High Street, , Santa Cruz/) === null,
      fetchCall: (fetch as ReturnType<typeof vi.fn>).mock.calls[0],
    }).toEqual({
      orderIdVisible: true,
      dateVisible: true,
      itemCountVisible: true,
      amountVisible: true,
      addressVisible: true,
      emptyLineOmitted: true,
      fetchCall: ['/seller/api/orders'],
    })
  })
})
