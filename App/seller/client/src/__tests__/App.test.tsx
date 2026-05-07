import {render, screen} from '@testing-library/react'
import {it} from 'vitest'
import React from 'react'

import {App} from '../App'

it('renders', async () => {
  render(<App/>)
  await screen.findByText('Dashboard')
})