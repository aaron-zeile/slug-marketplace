import {render, screen, fireEvent} from '@testing-library/react'
import {it, test, vi, expect} from 'vitest'
import React from 'react'

import Dashboard from '../dashboard'
import { ErrorProvider } from '../error/Provider'

it('throws error on failed fetch', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })),
  )

  render(
    <ErrorProvider>
      <Dashboard />
    </ErrorProvider>
  )

  await screen.findByText('Error: Internal Server Error')
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

  render(
    <ErrorProvider>
      <Dashboard />
    </ErrorProvider>
  )

  const close = await screen.findByLabelText('close error')
  fireEvent.click(close)
  expect(screen.queryByText('Error: Not Found')).toBeNull
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

  render(
    <ErrorProvider>
      <Dashboard />
    </ErrorProvider>
  )

  await screen.findByText('Error: Service Unavailable')
  fireEvent.mouseDown(document.body)
  fireEvent.click(document.body)
  expect(screen.queryByText('Error: Service Unavailable')).not.toBeNull()
})
