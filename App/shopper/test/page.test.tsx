import { it } from 'vitest'
import { render } from '@testing-library/react'

import Page from '../src/app/page'

it('Renders', async () => {
  render(<Page />)
})