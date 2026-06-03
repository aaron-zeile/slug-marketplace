import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = vi.hoisted(() => {
  return {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  };
});

const nextHeaders = vi.hoisted(() => {
  return {
    cookies: vi.fn(async () => cookieStore),
  };
});

vi.mock('next/headers', () => nextHeaders);

vi.mock('../../src/checkout/reservation/service', () => ({
  reserveCheckout: vi.fn(),
  releaseCheckoutReservation: vi.fn(),
  markCheckoutReservationPendingPayment: vi.fn(),
  confirmCheckoutReservation: vi.fn(),
}));

vi.mock('../../src/cart/service', () => ({
  clearCart: vi.fn(),
}));

vi.mock('../../src/server/auth/service', () => ({
  getSessionToken: vi.fn(),
  check: vi.fn(),
}));

import {
  confirmCheckoutReservation,
  markCheckoutReservationPendingPayment,
  releaseCheckoutReservation,
  reserveCheckout,
} from '../../src/checkout/reservation/service';
import { clearCart } from '../../src/cart/service';
import { check, getSessionToken } from '../../src/server/auth/service';
import type { CartItem } from '../../src/cart';
import {
  confirmCheckoutReservationAction,
  expireCheckoutAction,
  getCheckoutReservationIdFromCookie,
  markCheckoutPendingPaymentAction,
  releaseCheckoutReservationAction,
  reserveCheckoutAction,
} from '../../src/app/checkout/reservationActions';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'buyer@example.com',
  name: 'Buyer',
};

const cartItems = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    member: user.id,
    quantity: 2,
    item: {
      id: '33333333-3333-4333-8333-333333333333',
      seller: { id: '44444444-4444-4444-8444-444444444444', name: 'Seller' },
      name: 'Item',
      description: 'Item description',
      images: [],
      price: 10,
      quantity: 5,
      created_at: '2026-05-11T12:00:00.000Z',
      status: 'active' as const,
    },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionToken).mockResolvedValue('session');
  vi.mocked(check).mockResolvedValue(user);
  cookieStore.get.mockReturnValue(undefined);
});

describe('checkout reservation server actions', () => {
  it('reserveCheckoutAction reserves and sets a cookie', async () => {
    vi.mocked(reserveCheckout).mockResolvedValueOnce({
      id: '55555555-5555-4555-8555-555555555555',
      expiresAt: '2026-05-11T12:05:00.000Z',
    });

    const result = await reserveCheckoutAction(cartItems as CartItem[]);

    expect(result.success).toBe(true);
    expect(reserveCheckout).toHaveBeenCalledWith(user.id, [
      { itemId: cartItems[0].item.id, quantity: 2 },
    ]);
    expect(cookieStore.set).toHaveBeenCalledWith(
      'checkout_reservation',
      '55555555-5555-4555-8555-555555555555',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('reserveCheckoutAction returns not signed in for guests', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await reserveCheckoutAction(cartItems as CartItem[]);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
    expect(reserveCheckout).not.toHaveBeenCalled();
  });

  it('reserveCheckoutAction returns fallback error for non-Error throw', async () => {
    vi.mocked(reserveCheckout).mockRejectedValueOnce('boom');

    const result = await reserveCheckoutAction(cartItems as CartItem[]);

    expect(result).toEqual({ success: false, error: 'Unable to reserve items' });
  });

  it('reserveCheckoutAction returns Error message when Error is thrown', async () => {
    vi.mocked(reserveCheckout).mockRejectedValueOnce(new Error('reserve failed'));

    const result = await reserveCheckoutAction(cartItems as CartItem[]);

    expect(result).toEqual({ success: false, error: 'reserve failed' });
  });

  it('releaseCheckoutReservationAction clears the cookie', async () => {
    vi.mocked(releaseCheckoutReservation).mockResolvedValueOnce(true);

    const result = await releaseCheckoutReservationAction('res-1');

    expect(result).toEqual({ success: true, data: true });
    expect(cookieStore.delete).toHaveBeenCalledWith('checkout_reservation');
  });

  it('releaseCheckoutReservationAction returns fallback error for non-Error throw', async () => {
    vi.mocked(releaseCheckoutReservation).mockRejectedValueOnce('boom');

    const result = await releaseCheckoutReservationAction('res-1');

    expect(result).toEqual({ success: false, error: 'Release failed' });
  });

  it('releaseCheckoutReservationAction returns Error message when Error is thrown', async () => {
    vi.mocked(releaseCheckoutReservation).mockRejectedValueOnce(
      new Error('release failed'),
    );

    const result = await releaseCheckoutReservationAction('res-1');

    expect(result).toEqual({ success: false, error: 'release failed' });
  });

  it('markCheckoutPendingPaymentAction returns success when reservation is marked', async () => {
    vi.mocked(markCheckoutReservationPendingPayment).mockResolvedValueOnce(undefined);

    const result = await markCheckoutPendingPaymentAction('res-1');

    expect(result).toEqual({ success: true });
  });

  it('markCheckoutPendingPaymentAction returns a failure message on error', async () => {
    vi.mocked(markCheckoutReservationPendingPayment).mockRejectedValueOnce(
      new Error('Reservation expired'),
    );

    const result = await markCheckoutPendingPaymentAction('res-1');

    expect(result).toEqual({ success: false, error: 'Reservation expired' });
  });

  it('markCheckoutPendingPaymentAction returns fallback message on non-Error throw', async () => {
    vi.mocked(markCheckoutReservationPendingPayment).mockRejectedValueOnce('boom');

    const result = await markCheckoutPendingPaymentAction('res-1');

    expect(result).toEqual({ success: false, error: 'Reservation expired' });
  });

  it('confirmCheckoutReservationAction confirms and clears the cookie', async () => {
    vi.mocked(confirmCheckoutReservation).mockResolvedValueOnce(true);

    const result = await confirmCheckoutReservationAction('res-1');

    expect(result).toEqual({ success: true, data: true });
    expect(cookieStore.delete).toHaveBeenCalledWith('checkout_reservation');
  });

  it('confirmCheckoutReservationAction returns fallback error for non-Error throw', async () => {
    vi.mocked(confirmCheckoutReservation).mockRejectedValueOnce('boom');

    const result = await confirmCheckoutReservationAction('res-1');

    expect(result).toEqual({
      success: false,
      error: 'Unable to confirm reservation',
    });
  });

  it('confirmCheckoutReservationAction returns Error message when Error is thrown', async () => {
    vi.mocked(confirmCheckoutReservation).mockRejectedValueOnce(
      new Error('confirm failed'),
    );

    const result = await confirmCheckoutReservationAction('res-1');

    expect(result).toEqual({ success: false, error: 'confirm failed' });
  });

  it('expireCheckoutAction clears cart when a user is available', async () => {
    vi.mocked(releaseCheckoutReservation).mockResolvedValueOnce(true);

    const result = await expireCheckoutAction('res-1');

    expect(result).toEqual({ success: true });
    expect(clearCart).toHaveBeenCalledWith(user.id);
    expect(cookieStore.delete).toHaveBeenCalledWith('checkout_reservation');
  });

  it('expireCheckoutAction returns fallback error for non-Error throw', async () => {
    vi.mocked(releaseCheckoutReservation).mockRejectedValueOnce('boom');

    const result = await expireCheckoutAction('res-1');

    expect(result).toEqual({
      success: false,
      error: 'Unable to expire checkout',
    });
  });

  it('expireCheckoutAction returns Error message when Error is thrown', async () => {
    vi.mocked(releaseCheckoutReservation).mockRejectedValueOnce(
      new Error('expire failed'),
    );

    const result = await expireCheckoutAction('res-1');

    expect(result).toEqual({ success: false, error: 'expire failed' });
  });

  it('expireCheckoutAction does not clear cart when user is missing', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);
    vi.mocked(releaseCheckoutReservation).mockResolvedValueOnce(true);

    const result = await expireCheckoutAction('res-1');

    expect(result).toEqual({ success: true });
    expect(clearCart).not.toHaveBeenCalled();
  });

  it('getCheckoutReservationIdFromCookie reads the cookie value', async () => {
    cookieStore.get.mockReturnValueOnce({ value: 'res-cookie' });

    await expect(getCheckoutReservationIdFromCookie()).resolves.toBe('res-cookie');
  });
});

