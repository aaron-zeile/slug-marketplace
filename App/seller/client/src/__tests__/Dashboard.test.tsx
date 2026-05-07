import {render, screen} from '@testing-library/react'
import {it} from 'vitest'
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