import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import OrderHistory from '../../src/app/account/orders/OrderHistory';
import type { OrderWithDetails } from '../../src/order/enrich';

const baseOrder: OrderWithDetails = {
  id: 'order-1',
  buyer: 'buyer-1',
  status: 'ordered',
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

it('renders an order card for each order', () => {
  const secondOrder = {
    ...baseOrder,
    id: 'order-2',
    lineItems: [
      {
        ...baseOrder.lineItems[0],
        itemId: 'item-2',
        name: 'Desk Chair',
      },
    ],
  };

  render(<OrderHistory orders={[baseOrder, secondOrder]} />);

  expect(screen.getByText('Order order-1')).toBeInTheDocument();
  expect(screen.getByText('Order order-2')).toBeInTheDocument();
});
