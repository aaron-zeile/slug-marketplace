import { it } from 'vitest'
import { render } from '@testing-library/react'

import CartPage from '../../src/app/cart/page'

it('Renders', async () => {
  render(
    <CartPage />
  );
})