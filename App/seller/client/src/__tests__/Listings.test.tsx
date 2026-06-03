import {fireEvent, screen, waitFor} from '@testing-library/react'
import {expect, it, vi} from 'vitest'
import React from 'react'

import Listings from '../dashboard/Listings'
import { renderWithProviders } from '../test/renderWithProviders'

it('renders listings', async () => {
  const listings = [
    {
      id: 'da9d705c-0f9e-4e30-ab80-435abdf25284',
      seller: {
        id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
        name: 'Taylor Brooks',
      },
      name: 'USB Hub 937',
      description: 'Crafted with care to deliver outstanding value and satisfaction.',
      price: 441.37,
      quantity: 1,
      created_at: '2025-07-18T23:28:50.000Z',
      status: 'active'
    },
  ]

  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => ({ listings }),
  }))

  vi.stubGlobal('fetch', fetchMock)

  renderWithProviders(<Listings />)

  expect(await screen.findByText('USB Hub 937')).toBeInTheDocument()
}, 15000)

it('updates a listing only after edits are made', async () => {
  const listing = {
    id: 'da9d705c-0f9e-4e30-ab80-435abdf25284',
    seller: {
      id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
      name: 'Taylor Brooks',
    },
    name: 'USB Hub 937',
    description: 'Crafted with care to deliver outstanding value and satisfaction.',
    price: 441.37,
    quantity: 1,
    created_at: '2025-07-18T23:28:50.000Z',
    images: ['https://example.com/hub.jpg'],
    status: 'active'
  }

  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: [] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        listing: {
          ...listing,
          name: 'USB Hub Pro',
        },
      }),
    })

  vi.stubGlobal('fetch', fetchMock)

  renderWithProviders(<Listings />)

  fireEvent.click(await screen.findByText('USB Hub 937'))

  const nameInput = await screen.findByLabelText('Name for USB Hub 937')
  fireEvent.change(nameInput, { target: { value: 'USB Hub Pro' } })

  const updateButton = await screen.findByRole('button', {
    name: 'Update USB Hub 937',
  })
  fireEvent.click(updateButton)

  let updateCall: unknown[] | undefined
  await waitFor(() => {
    updateCall = fetchMock.mock.calls.find(
      ([url, options]) =>
        url === '/seller/api/listings/da9d705c-0f9e-4e30-ab80-435abdf25284' &&
        options?.method === 'PUT',
    )
    if (!updateCall) {
      throw new Error('Expected update request to be sent')
    }
  })
  await waitFor(() => {
    if (screen.queryByRole('dialog') !== null) {
      throw new Error('Expected edit dialog to close')
    }
  })

  expect({
    dialogClosed: screen.queryByRole('dialog') === null,
    updateCall,
  }).toEqual({
    dialogClosed: true,
    updateCall: [
      '/seller/api/listings/da9d705c-0f9e-4e30-ab80-435abdf25284',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          name: 'USB Hub Pro',
          description: listing.description,
          price: listing.price,
          quantity: listing.quantity,
          images: listing.images,
        }),
      }),
    ],
  })
}, 15000)
