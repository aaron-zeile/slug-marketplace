import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import * as loginActions from '../../src/app/buyer/login/actions';
import CheckoutPaymentPage from '../../src/app/checkout/payment/page';
import CheckoutShippingPage from '../../src/app/checkout/shipping/page';

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  );
  return {
    ...actual,
    redirect: redirectMock,
    useRouter: () => ({
      push: vi.fn(),
    }),
    usePathname: () => '/',
  };
});

vi.mock('../../src/app/buyer/topbar', () => ({
  default: () => <div data-testid="topbar" />,
}));

vi.mock('../../src/app/checkout/shipping/CheckoutShipping', () => ({
  default: () => <div data-testid="checkout-shipping" />,
}));

vi.mock('../../src/app/buyer/payment/Payment', () => ({
  default: () => <div data-testid="payment" />,
}));

const sessionUser = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'buyer@example.com',
  name: 'Buyer',
};

beforeEach(() => {
  redirectMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url });
  });
  vi.restoreAllMocks();
});

async function expectRedirect(
  run: () => Promise<unknown>,
  url: string,
) {
  await expect(run()).rejects.toMatchObject({ url });
  expect(redirectMock).toHaveBeenCalledWith(url);
}

it('redirects guests away from checkout shipping', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(
    () => CheckoutShippingPage(),
    '/',
  );
});

it('renders checkout shipping for signed-in users', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });

  const tree = await CheckoutShippingPage();

  render(tree);

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByTestId('checkout-shipping')).toBeInTheDocument();
});

it('redirects guests away from checkout payment', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(
    () => CheckoutPaymentPage({ searchParams: Promise.resolve({}) }),
    '/',
  );
});

it('redirects to shipping when payment has no addressId', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });

  await expectRedirect(
    () => CheckoutPaymentPage({ searchParams: Promise.resolve({}) }),
    '/checkout/shipping',
  );
});

it('renders checkout payment when signed in with an addressId', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });

  const tree = await CheckoutPaymentPage({
    searchParams: Promise.resolve({
      addressId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    }),
  });

  render(tree);

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByTestId('payment')).toBeInTheDocument();
});
