import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';

import OrderCard from '../../src/app/account/orders/OrderCard';
import type { OrderWithDetails } from '../../src/order/enrich';

const order: OrderWithDetails = {
  id: 'order-1',
  buyer: 'buyer-1',
  purchaseAmount: 25,
  orderedAt: '2026-05-17T19:23:00.000Z',
  address: {
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95060',
    country: 'US',
  },
  items: [{ itemId: 'item-1', sellerId: 'seller-1' }],
  lineItems: [
    {
      itemId: 'item-1',
      sellerId: 'seller-1',
      quantity: 1,
      name: 'Vintage Lamp',
      image: 'https://example.com/lamp.jpg',
      price: 25,
    },
  ],
};

it('expands the item breakdown when the user clicks view breakdown', async () => {
  const user = userEvent.setup();

  render(<OrderCard order={order} />);

  expect(screen.queryByText('Vintage Lamp')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /view item breakdown/i }));

  expect(screen.getByText('Vintage Lamp')).toBeInTheDocument();
  expect(screen.getByText('Qty 1')).toBeInTheDocument();
  expect(screen.getByText('Order total')).toBeInTheDocument();
  expect(screen.getAllByText('$25.00').length).toBeGreaterThanOrEqual(2);
  expect(screen.getByRole('link', { name: 'Vintage Lamp' })).toHaveAttribute(
    'href',
    '/items/item-1',
  );
});
