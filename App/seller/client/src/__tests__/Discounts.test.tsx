import {fireEvent, screen, waitFor} from '@testing-library/react'
import {expect, it, vi} from 'vitest'
import React from 'react'

import Discounts from '../dashboard/Discounts'
import { renderWithProviders } from '../test/renderWithProviders'

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  quantity: 1,
  created_at: '2026-06-03T12:00:00.000Z',
  images: [],
  status: 'active',
}

const discount = {
  id: 'discount-1',
  itemId: 'item-1',
  discountPercent: 15,
  duration: 7,
  created_at: '2026-06-03T12:00:00.000Z',
}

it('creates discounts for seller listings', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discount }),
    })

  vi.stubGlobal('fetch', fetchMock)

  renderWithProviders(<Discounts />)

  expect(await screen.findByText('USB Hub')).toBeInTheDocument()

  fireEvent.change(screen.getByRole('spinbutton', { name: /Discount %/ }), {
    target: { value: '15' },
  })
  fireEvent.change(screen.getByRole('spinbutton', { name: /Duration in days/ }), {
    target: { value: '7' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create Discount' }))

  await waitFor(() => {
    if (!screen.queryByText('Discount created for USB Hub.')) {
      throw new Error('Expected success message')
    }
  })

  expect({
    createCall: fetchMock.mock.calls[2],
    percentCellVisible: screen.getByText('15%') !== null,
    durationCellVisible: screen.getByText('7 days') !== null,
  }).toEqual({
    createCall: [
      '/seller/api/listings/item-1/discounts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          discountPercent: 15,
          duration: 7,
        }),
      }),
    ],
    percentCellVisible: true,
    durationCellVisible: true,
  })
})
