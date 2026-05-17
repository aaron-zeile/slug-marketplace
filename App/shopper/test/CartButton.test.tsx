import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import CartButton from '../src/app/buyer/topbar/CartButton';
import { routerSpy } from './mockRouter';

it('routes to the cart page when clicked', () => {
  render(<CartButton />);

  fireEvent.click(screen.getByLabelText('Open cart'));

  expect(routerSpy).toHaveBeenCalledWith('/cart');
});
