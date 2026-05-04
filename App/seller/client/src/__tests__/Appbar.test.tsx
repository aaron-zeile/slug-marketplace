import {render, screen} from '@testing-library/react'
import {it} from 'vitest'
import React from 'react'

import AppBar from '../dashboard/Appbar'

it('renders', async () => {
  render(<AppBar/>)
  await screen.findByLabelText('open menu')
})