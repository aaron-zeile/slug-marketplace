import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import CheckoutCompletePage from '../../src/app/checkout/complete/page';

const redirectMock = vi.hoisted(() => vi.fn());
const retrieveMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  );
  return {
    ...actual,
    redirect: redirectMock,
  };
});

vi.mock('stripe', () => {
  class StripeMock {
    paymentIntents = {
      retrieve: retrieveMock,
    };
    constructor(_key: string) {}
  }
  return { default: StripeMock };
});

vi.mock('../../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
}));

vi.mock('../../src/app/cart/actions', () => ({
  fetchCartItemsAction: vi.fn(),
  clearCartAction: vi.fn(),
}));

vi.mock('../../src/app/account/actions', () => ({
  listAddressesAction: vi.fn(),
}));

vi.mock('../../src/app/order/actions', () => ({
  createOrderAction: vi.fn(),
}));

vi.mock('../../src/app/checkout/reservationActions', () => ({
  confirmCheckoutReservationAction: vi.fn(),
  getCheckoutReservationIdFromCookie: vi.fn(),
}));

import { checkLogin } from '../../src/app/buyer/login/actions';
import { listAddressesAction } from '../../src/app/account/actions';
import { clearCartAction, fetchCartItemsAction } from '../../src/app/cart/actions';
import { createOrderAction } from '../../src/app/order/actions';
import {
  confirmCheckoutReservationAction,
  getCheckoutReservationIdFromCookie,
} from '../../src/app/checkout/reservationActions';

const sessionUser = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'buyer@example.com',
  name: 'Buyer',
};

beforeEach(() => {
  vi.clearAllMocks();
  redirectMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url });
  });
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';

  vi.mocked(checkLogin).mockResolvedValue({ user: sessionUser });
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
    data: [
      {
        id: 'cart-1',
        member: sessionUser.id,
        quantity: 1,
        item: {
          id: 'item-1',
          seller: { id: 'seller-1', name: 'Seller' },
          name: 'Item',
          description: 'Item description',
          images: [],
          price: 10,
          quantity: 1,
          created_at: '2026-05-11T12:00:00.000Z',
          status: 'active',
        },
      },
    ],
  });
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [
      {
        id: 'addr-1',
        member: sessionUser.id,
        label: 'Home',
        line1: '123 Main St',
        line2: undefined,
        city: 'Springfield',
        state: 'IL',
        postal_code: '62701',
        country: 'US',
        is_default: true,
        created_at: '2026-05-11T12:00:00.000Z',
        updated_at: '2026-05-11T12:00:00.000Z',
      },
    ],
  });
  vi.mocked(createOrderAction).mockResolvedValue({
    success: true,
    data: {
      id: 'order-1',
    },
  } as any);
  vi.mocked(getCheckoutReservationIdFromCookie).mockResolvedValue(undefined);
  vi.mocked(confirmCheckoutReservationAction).mockResolvedValue({
    success: true,
    data: true,
  });

  retrieveMock.mockResolvedValue({
    status: 'succeeded',
    amount_received: 1000,
    metadata: {
      buyerId: sessionUser.id,
      addressId: 'addr-1',
    },
  });
});

async function expectRedirect(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toMatchObject({ url });
  expect(redirectMock).toHaveBeenCalledWith(url);
}

it('renders an error when payment_intent is missing', async () => {
  const tree = await CheckoutCompletePage({ searchParams: Promise.resolve({}) });
  render(tree);

  expect(screen.getByText('Unable to complete order')).toBeInTheDocument();
  expect(screen.getByText('Missing payment confirmation.')).toBeInTheDocument();
});

it('redirects guests away from checkout complete', async () => {
  vi.mocked(checkLogin).mockResolvedValueOnce({});

  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
    '/',
  );
});

it('completes the order, clears cart, and redirects to orders', async () => {
  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
    '/account/orders',
  );

  expect(createOrderAction).toHaveBeenCalledWith(
    expect.objectContaining({
      items: [{ itemId: 'item-1', sellerId: 'seller-1' }],
    }),
  );
  expect(clearCartAction).toHaveBeenCalled();
});

it('passes repeated line items for cart quantities greater than one', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValueOnce({
    success: true,
    data: [
      {
        id: 'cart-1',
        member: sessionUser.id,
        quantity: 3,
        item: {
          id: 'item-1',
          seller: { id: 'seller-1', name: 'Seller' },
          name: 'Item',
          description: 'Item description',
          images: [],
          price: 10,
          quantity: 10,
          created_at: '2026-05-11T12:00:00.000Z',
          status: 'active',
        },
      },
    ],
  });

  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
    '/account/orders',
  );

  expect(createOrderAction).toHaveBeenCalledWith(
    expect.objectContaining({
      items: [
        { itemId: 'item-1', sellerId: 'seller-1' },
        { itemId: 'item-1', sellerId: 'seller-1' },
        { itemId: 'item-1', sellerId: 'seller-1' },
      ],
    }),
  );
});

it('confirms reservation when cookie id is present', async () => {
  vi.mocked(getCheckoutReservationIdFromCookie).mockResolvedValueOnce('res-1');

  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
      '/account/orders',
  );

  expect(confirmCheckoutReservationAction).toHaveBeenCalledWith('res-1');
});

it('renders an error when stripe key is not configured', async () => {
  delete process.env.STRIPE_SECRET_KEY;

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(screen.getByText('Stripe is not configured.')).toBeInTheDocument();
});

it('renders an error when payment has not succeeded', async () => {
  retrieveMock.mockResolvedValueOnce({
    status: 'processing',
    amount_received: 1000,
    metadata: {
      buyerId: sessionUser.id,
      addressId: 'addr-1',
    },
  });

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(
    screen.getByText('The payment has not succeeded yet.'),
  ).toBeInTheDocument();
});

it('renders an error when payment buyer does not match session', async () => {
  retrieveMock.mockResolvedValueOnce({
    status: 'succeeded',
    amount_received: 1000,
    metadata: {
      buyerId: 'another-user-id',
      addressId: 'addr-1',
    },
  });

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(
    screen.getByText('This payment does not belong to your account.'),
  ).toBeInTheDocument();
});

it('renders an error when payment metadata has no address id', async () => {
  retrieveMock.mockResolvedValueOnce({
    status: 'succeeded',
    amount_received: 1000,
    metadata: {
      buyerId: sessionUser.id,
      addressId: '',
    },
  });

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(
    screen.getByText('Missing shipping address for this payment.'),
  ).toBeInTheDocument();
});

it('redirects to orders when cart is empty', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValueOnce({
    success: true,
    data: [],
  });

  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
      '/account/orders',
  );
});

it('treats cart as empty when cart fetch is unsuccessful', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValueOnce({
    success: false,
    error: 'cart unavailable',
  } as any);

  await expectRedirect(
    () =>
      CheckoutCompletePage({
        searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
      }),
      '/account/orders',
  );
});

it('renders an error when shipping address cannot be found', async () => {
  vi.mocked(listAddressesAction).mockResolvedValueOnce({
    success: true,
    data: [],
  });

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(
    screen.getByText('Could not find the shipping address for this order.'),
  ).toBeInTheDocument();
});

it('renders an error when address fetch is unsuccessful', async () => {
  vi.mocked(listAddressesAction).mockResolvedValueOnce({
    success: false,
    error: 'address unavailable',
  } as any);

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(
    screen.getByText('Could not find the shipping address for this order.'),
  ).toBeInTheDocument();
});

it('renders create-order error message when provided by action', async () => {
  vi.mocked(createOrderAction).mockResolvedValueOnce({
    success: false,
    error: 'Order service down',
  } as any);

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(screen.getByText('Order service down')).toBeInTheDocument();
});

it('renders fallback create-order error when action returns empty error', async () => {
  vi.mocked(createOrderAction).mockResolvedValueOnce({
    success: false,
    error: '',
  } as any);

  const tree = await CheckoutCompletePage({
    searchParams: Promise.resolve({ payment_intent: 'pi_123' }),
  });
  render(tree);

  expect(screen.getByText('Could not create order.')).toBeInTheDocument();
});

