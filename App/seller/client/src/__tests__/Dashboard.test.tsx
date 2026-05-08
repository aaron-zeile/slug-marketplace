import {render, screen, fireEvent} from '@testing-library/react'
import {it, expect} from 'vitest'
import React from 'react'

import Dashboard from '../dashboard'

it('renders top bar', async () => {
  render(<Dashboard/>)
  await screen.findByText('Dashboard')
})

it('renders tabs', async () => {
  render(<Dashboard/>)
  await screen.findByText('Listings')
})

it('tab selection changes on click', () => {
  render(<Dashboard />)
  const sales = screen.getByRole('tab', { name: 'Sales' })
  fireEvent.click(sales)
  expect(sales.getAttribute('aria-selected')).toBe('true')
})