import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import React from 'react'

import {App} from '../App'

const listingsResponse = {
  listings: [
    {
      id: 'item-1',
      seller: {
        id: 'seller-1',
        name: 'Test Seller',
      },
      name: 'USB Hub',
      description: 'A useful hub.',
      price: 24.99,
      quantity: 1,
      created_at: '2025-07-18T23:28:50.000Z',
      images: [],
      status: 'active'
    },
  ],
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url

        if (url.includes('/seller/api/sessions')) {
          return {
            ok: true,
            json: async () => ({
              user: {
                id: 'seller-1',
                email: 'seller@example.com',
                name: 'Test Seller',
              },
            }),
          }
        }

        if (url.includes('/seller/api/orders')) {
          return {
            ok: true,
            json: async () => ({
              orders: [],
            }),
          }
        }

        if (url.includes('/seller/api/analytics/average-rating')) {
          return {
            ok: true,
            json: async () => ({
              averageRating: 4.5,
            }),
          }
        }

        if (url.includes('/seller/api/analytics/star-distribution')) {
          return {
            ok: true,
            json: async () => ({
              ratings: [1, 2, 3, 4, 5],
            }),
          }
        }

        if (url.includes('/seller/api/keys')) {
          return {
            ok: true,
            json: async () => ({
              keys: [],
            }),
          }
        }

        return {
          ok: true,
          json: async () => listingsResponse,
        }
      }),
    )
  })

  it('renders the dashboard listings tab first', async () => {
    render(<App/>)

    const listing = await screen.findByText('USB Hub', undefined, {
      timeout: 10000,
    })

    expect({
      titleVisible: screen.queryByText('Dashboard') !== null,
      listingVisible: listing !== null,
    }).toEqual({
      titleVisible: true,
      listingVisible: true,
    })
  }, 15000)

  it('changes the visible dashboard content when tabs are selected', async () => {
    render(<App/>)

    await screen.findByText('Dashboard', undefined, {
      timeout: 10000,
    })

    const salesTab = screen.getByRole('tab', {name: 'Sales'})
    fireEvent.click(salesTab)
    await waitFor(() => {
      if (salesTab.getAttribute('aria-selected') !== 'true') {
        throw new Error('Sales tab was not selected')
      }
    })
    const afterSalesClick = {
      salesVisible: screen.queryByText('No orders yet') !== null,
      listingVisible: screen.queryByText('USB Hub') !== null,
    }

    fireEvent.click(screen.getByRole('tab', {name: 'Analytics'}))
    await screen.findByText('Seller Rating')
    const afteranalyticsClick = {
      analyticsVisible: screen.queryByText('Seller Rating') !== null,
      salesVisible: screen.queryByText('No orders yet') !== null,
    }

    fireEvent.click(screen.getByRole('tab', {name: 'Create Listing'}))
    await screen.findByRole('heading', {name: 'Create Listing'})
    expect({
      afterSalesClick,
      afteranalyticsClick,
      afterCreateListingClick: {
        createHeadingVisible:
          screen.queryByRole('heading', {name: 'Create Listing'}) !== null,
        analyticsVisible: screen.queryByText('Seller Rating') !== null,
      },
    }).toEqual({
      afterSalesClick: {
        salesVisible: true,
        listingVisible: false,
      },
      afteranalyticsClick: {
        analyticsVisible: true,
        salesVisible: false,
      },
      afterCreateListingClick: {
        createHeadingVisible: true,
        analyticsVisible: false,
      },
    })

    fireEvent.click(screen.getByRole('tab', {name: 'API Keys'}))
    await screen.findByRole('heading', {name: 'API Keys'})
  }, 15000)
})
