import {render, screen} from '@testing-library/react'
import {it} from 'vitest'

import Dashboard from '../dashboard'

it('renders', async () => {
  render(<Dashboard/>)
  await screen.findByText('Dashboard')
})