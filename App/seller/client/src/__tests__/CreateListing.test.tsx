import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import React from 'react'

import CreateListing from '../dashboard/CreateListing'
import {TabProvider} from '../dashboard/Provider'
import AppProviders from '../providers/AppProviders'
import {renderWithProviders} from '../test/renderWithProviders'

const createdListing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  created_at: '2025-07-18T23:28:50.000Z',
  images: ['https://example.com/hub.png'],
}

describe('CreateListing', () => {
  const nameField = () => screen.getByRole('textbox', {name: /name/i})
  const descriptionField = () =>
    screen.getByRole('textbox', {name: /description/i})
  const priceField = () => screen.getByRole('spinbutton', {name: /price/i})
  const imagesField = () => screen.getByRole('textbox', {name: /image urls/i})

  it('does not submit while the price is invalid', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<CreateListing />)

    fireEvent.change(nameField(), {
      target: {value: 'USB Hub'},
    })
    fireEvent.change(descriptionField(), {
      target: {value: 'A useful hub.'},
    })
    fireEvent.change(priceField(), {
      target: {value: '0'},
    })

    fireEvent.click(screen.getByRole('button', {name: 'Create Listing'}))

    expect({
      priceErrorVisible:
        screen.queryByText('Price must be at least $0.01.') !== null,
      submitDisabled: screen
        .getByRole('button', {name: 'Create Listing'})
        .hasAttribute('disabled'),
      fetchCalls: fetchMock.mock.calls,
    }).toEqual({
      priceErrorVisible: true,
      submitDisabled: true,
      fetchCalls: [],
    })
  })

  it('submits the form, shows success, and clears the fields', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        listing: createdListing,
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<CreateListing />)

    fireEvent.change(nameField(), {
      target: {value: 'USB Hub'},
    })
    fireEvent.change(descriptionField(), {
      target: {value: 'A useful hub.'},
    })
    fireEvent.change(priceField(), {
      target: {value: '24.99'},
    })
    fireEvent.change(imagesField(), {
      target: {value: 'https://example.com/hub.png\n\n  '},
    })
    fireEvent.click(screen.getByRole('button', {name: 'Create Listing'}))

    await screen.findByText('Created USB Hub.')
    await waitFor(() => {
      if ((nameField() as HTMLInputElement).value !== '') {
        throw new Error('Name field did not clear')
      }
    })
    expect({
      successVisible: screen.queryByText('Created USB Hub.') !== null,
      fetchCall: fetchMock.mock.calls[0],
      fieldValues: {
        name: (nameField() as HTMLInputElement).value,
        description: (descriptionField() as HTMLTextAreaElement).value,
        price: (priceField() as HTMLInputElement).value,
        images: (imagesField() as HTMLTextAreaElement).value,
      },
    }).toEqual({
      successVisible: true,
      fetchCall: [
        '/seller/api/listings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'USB Hub',
            description: 'A useful hub.',
            price: 24.99,
            images: ['https://example.com/hub.png'],
          }),
        },
      ],
      fieldValues: {
        name: '',
        description: '',
        price: '',
        images: '',
      },
    })
  })

  it('can render without an error provider and still report a create failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unauthorized',
      })),
    )

    render(
      <AppProviders>
        <TabProvider>
          <CreateListing />
        </TabProvider>
      </AppProviders>,
    )

    fireEvent.change(nameField(), {
      target: {value: 'USB Hub'},
    })
    fireEvent.change(descriptionField(), {
      target: {value: 'A useful hub.'},
    })
    fireEvent.change(priceField(), {
      target: {value: '24.99'},
    })
    fireEvent.click(screen.getByRole('button', {name: 'Create Listing'}))

    await waitFor(() => {
      if (
        screen
          .getByRole('button', {name: 'Create Listing'})
          .hasAttribute('disabled')
      ) {
        throw new Error('Submit button is still disabled')
      }
    })
    expect({
      submitDisabled: screen
        .getByRole('button', {name: 'Create Listing'})
        .hasAttribute('disabled'),
      successVisible: screen.queryByText('Created USB Hub.') !== null,
    }).toEqual({
      submitDisabled: false,
      successVisible: false,
    })
  })
})
