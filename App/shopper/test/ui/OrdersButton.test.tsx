import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import OrdersButton from '../../src/app/buyer/topbar/OrdersButton';

it('links to the orders page when logged in', async () => {
  render(<OrdersButton isAuthenticated />);

  const link = await screen.findByRole('link', { name: 'Orders' });

  expect(link).toHaveAttribute('href', '/account/orders');
});

it('does not render when logged out', () => {
  render(<OrdersButton isAuthenticated={false} />);

  expect(screen.queryByRole('link', { name: 'Orders' })).toBeNull();
});
