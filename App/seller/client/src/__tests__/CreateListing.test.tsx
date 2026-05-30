import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import React from 'react'

import CreateListing from '../dashboard/CreateListing'
import {TabContext} from '../dashboard/Context'
import {TabProvider} from '../dashboard/Provider'
import AppProviders from '../providers/AppProviders'
import {ErrorProvider} from '../error/Provider'
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
  quantity: 1,
  created_at: '2025-07-18T23:28:50.000Z',
  images: ['https://example.com/hub.png'],
  status: 'active'
}

describe('CreateListing', () => {
  const nameField = () => screen.getByRole('textbox', {name: /name/i})
  const descriptionField = () =>
    screen.getByRole('textbox', {name: /description/i})
  const priceField = () => screen.getByRole('spinbutton', {name: /price/i})
  const quantityField = () =>
    screen.getByRole('spinbutton', {name: /quantity/i})
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

  it('returns early from form submit while the price is invalid', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const {container} = renderWithProviders(<CreateListing />)

    fireEvent.change(nameField(), {
      target: {value: 'USB Hub'},
    })
    fireEvent.change(descriptionField(), {
      target: {value: 'A useful hub.'},
    })
    fireEvent.change(priceField(), {
      target: {value: '0'},
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect({
      priceErrorVisible:
        screen.queryByText('Price must be at least $0.01.') !== null,
      fetchCalls: fetchMock.mock.calls,
    }).toEqual({
      priceErrorVisible: true,
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
    fireEvent.change(quantityField(), {
      target: {value: '3'},
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
        quantity: (quantityField() as HTMLInputElement).value,
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
            quantity: 3,
            images: ['https://example.com/hub.png'],
          }),
        },
      ],
      fieldValues: {
        name: '',
        description: '',
        price: '',
        quantity: '',
        images: '',
      },
    })
  })

  it('switches back to listings when the success view button is clicked', async () => {
    const setTab = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          listing: createdListing,
        }),
      })),
    )

    render(
      <AppProviders>
        <ErrorProvider>
          <TabContext.Provider value={{tabValue: 3, setTab}}>
            <CreateListing />
          </TabContext.Provider>
        </ErrorProvider>
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
    fireEvent.change(quantityField(), {
      target: {value: '3'},
    })
    fireEvent.click(screen.getByRole('button', {name: 'Create Listing'}))

    await screen.findByText('Created USB Hub.')
    fireEvent.click(screen.getByRole('button', {name: 'View'}))

    expect(setTab.mock.calls).toEqual([[0]])
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
    fireEvent.change(quantityField(), {
      target: {value: '3'},
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
