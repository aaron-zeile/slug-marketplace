import {render, screen} from '@testing-library/react'
import {it, vi} from 'vitest'
import React from 'react'

import Listings from '../dashboard/Listings'

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
      created_at: '2025-07-18T23:28:50.000Z',
    },
  ]

  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => ({ listings }),
  }))

  vi.stubGlobal('fetch', fetchMock)

  render(<Listings />)

  await screen.findByText('USB Hub 937')
})