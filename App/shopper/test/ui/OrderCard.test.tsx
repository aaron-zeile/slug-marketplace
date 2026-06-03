import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as nextIntl from 'next-intl';
import { afterEach, expect, it, vi } from 'vitest';

import OrderCard from '../../src/app/account/orders/OrderCard';
import type { OrderWithDetails } from '../../src/order/enrich';

const order: OrderWithDetails = {
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

function orderWith(
  overrides: Partial<OrderWithDetails> & {
    lineItems?: OrderWithDetails['lineItems'];
  },
): OrderWithDetails {
  return {
    ...order,
    ...overrides,
    address: { ...order.address, ...overrides.address },
    lineItems: overrides.lineItems ?? order.lineItems,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

it('shows the order status', () => {
  render(<OrderCard order={order} />);

  expect(screen.getByText('Ordered')).toBeInTheDocument();
});

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

it('shows shipping and delivered statuses', () => {
  render(<OrderCard order={orderWith({ status: 'shipping' })} />);
  expect(screen.getByText('Shipped')).toBeInTheDocument();

  render(<OrderCard order={orderWith({ id: 'order-2', status: 'delivered' })} />);
  expect(screen.getByText('Delivered')).toBeInTheDocument();
});

it('falls back to ordered for unknown status values', () => {
  render(<OrderCard order={orderWith({ status: 'pending' as OrderWithDetails['status'] })} />);

  expect(screen.getByText('Ordered')).toBeInTheDocument();
});

it('formats dates using the French locale tag', () => {
  vi.spyOn(nextIntl, 'useLocale').mockReturnValue('fr');

  render(<OrderCard order={order} />);

  const expected = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.orderedAt));

  expect(screen.getByText(expected)).toBeInTheDocument();
});

it('shows plural item count and full shipping address', () => {
  render(
    <OrderCard
      order={orderWith({
        address: {
          line1: '123 Main St',
          line2: 'Apt 4',
          city: 'Santa Cruz',
          state: 'CA',
          postalCode: '95060',
          country: 'US',
        },
        lineItems: [
          { ...order.lineItems[0], quantity: 2 },
          {
            itemId: 'item-2',
            sellerId: 'seller-2',
            quantity: 1,
            name: 'Desk Chair',
            image: 'https://example.com/chair.jpg',
            price: 10,
          },
        ],
      })}
    />,
  );

  expect(screen.getByText('3 items')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Shipping to: 123 Main St, Apt 4, Santa Cruz, CA, 95060, US',
    ),
  ).toBeInTheDocument();
});

it('renders unavailable line items without links or prices', async () => {
  const user = userEvent.setup();

  render(
    <OrderCard
      order={orderWith({
        lineItems: [
          {
            itemId: 'item-missing',
            sellerId: 'seller-1',
            quantity: 1,
            name: 'Item item-missing',
            price: 0,
            unavailable: true,
          },
        ],
      })}
    />,
  );

  await user.click(screen.getByRole('button', { name: /view item breakdown/i }));

  expect(screen.getByText('This listing is no longer available.')).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Item item-missing' })).toBeNull();
});

it('shows a placeholder when a line item has no image', async () => {
  const user = userEvent.setup();

  render(
    <OrderCard
      order={orderWith({
        lineItems: [
          {
            ...order.lineItems[0],
            image: undefined,
          },
        ],
      })}
    />,
  );

  await user.click(screen.getByRole('button', { name: /view item breakdown/i }));

  expect(screen.getByText('No image')).toBeInTheDocument();
});

it('collapses the breakdown when toggled again', async () => {
  const user = userEvent.setup();

  render(<OrderCard order={order} />);

  const toggle = screen.getByRole('button', { name: /view item breakdown/i });
  await user.click(toggle);
  expect(screen.getByRole('button', { name: /hide item breakdown/i })).toHaveAttribute(
    'aria-expanded',
    'true',
  );

  await user.click(screen.getByRole('button', { name: /hide item breakdown/i }));
  expect(screen.getByRole('button', { name: /view item breakdown/i })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
