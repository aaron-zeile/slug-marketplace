import {fireEvent, render, screen} from '@testing-library/react'
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
      vi.fn(async () => ({
        ok: true,
        json: async () => listingsResponse,
      })),
    )
  })

  it('renders the dashboard listings tab first', async () => {
    render(<App/>)

    await screen.findByLabelText('Name for USB Hub')

    expect({
      titleVisible: screen.queryByText('Dashboard') !== null,
      listingVisible: screen.queryByLabelText('Name for USB Hub') !== null,
    }).toEqual({
      titleVisible: true,
      listingVisible: true,
    })
  })

  it('changes the visible dashboard content when tabs are selected', async () => {
    render(<App/>)

    await screen.findByLabelText('Name for USB Hub')

    fireEvent.click(screen.getByRole('tab', {name: 'Sales'}))
    const afterSalesClick = {
      salesVisible: screen.queryByText('Sales — coming soon') !== null,
      listingVisible: screen.queryByLabelText('Name for USB Hub') !== null,
    }

    fireEvent.click(screen.getByRole('tab', {name: 'Feedback'}))
    const afterFeedbackClick = {
      feedbackVisible: screen.queryByText('Feedback — coming soon') !== null,
      salesVisible: screen.queryByText('Sales — coming soon') !== null,
    }

    fireEvent.click(screen.getByRole('tab', {name: 'Create Listing'}))
    expect({
      afterSalesClick,
      afterFeedbackClick,
      afterCreateListingClick: {
        createHeadingVisible:
          screen.queryByRole('heading', {name: 'Create Listing'}) !== null,
        feedbackVisible: screen.queryByText('Feedback — coming soon') !== null,
      },
    }).toEqual({
      afterSalesClick: {
        salesVisible: true,
        listingVisible: false,
      },
      afterFeedbackClick: {
        feedbackVisible: true,
        salesVisible: false,
      },
      afterCreateListingClick: {
        createHeadingVisible: true,
        feedbackVisible: false,
      },
    })
  })
})
