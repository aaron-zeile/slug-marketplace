import {render, screen, fireEvent} from '@testing-library/react'
import {it, test, vi, expect} from 'vitest'
import React from 'react'

import Listings from '../dashboard/Listings'
import { renderWithProviders } from '../test/renderWithProviders'

it('throws error on failed fetch', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })),
  )

  renderWithProviders(<Listings />)

  expect(await screen.findByText('Error: Internal Server Error')).toBeInTheDocument()
})

test('close error snackbar', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })),
  )

  renderWithProviders(<Listings />)

  const close = await screen.findByLabelText('Close error message')
  fireEvent.click(close)
  expect(screen.queryByText('Error: Not Found')).toBeNull()
})

test('keeps error snackbar open on clickaway', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    })),
  )

  renderWithProviders(<Listings />)

  await screen.findByText('Error: Service Unavailable')
  fireEvent.mouseDown(document.body)
  fireEvent.click(document.body)
  expect(screen.queryByText('Error: Service Unavailable')).not.toBeNull()
})
