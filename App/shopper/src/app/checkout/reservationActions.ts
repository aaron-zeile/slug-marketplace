'use server';

import { cookies } from 'next/headers';

import type { CartItem } from '../../cart';
import {
  confirmCheckoutReservation,
  markCheckoutReservationPendingPayment,
  releaseCheckoutReservation,
  reserveCheckout,
} from '../../checkout/reservation/service';
import { clearCart } from '../../cart/service';
import { check, getSessionToken } from '../../server/auth/service';

const RESERVATION_COOKIE = 'checkout_reservation';

async function getCurrentUser() {
  const token = await getSessionToken();
  return token ? check(token) : undefined;
}

async function setReservationCookie(reservationId: string, expiresAt: string) {
  const store = await cookies();
  store.set(RESERVATION_COOKIE, reservationId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    expires: new Date(expiresAt),
  });
}

async function clearReservationCookie() {
  const store = await cookies();
  store.delete(RESERVATION_COOKIE);
}

export async function reserveCheckoutAction(cartItems: CartItem[]) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const reservation = await reserveCheckout(
      user.id,
      cartItems.map((cartItem) => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      })),
    );

    await setReservationCookie(reservation.id, reservation.expiresAt);

    return {
      success: true as const,
      data: {
        id: reservation.id,
        expiresAt: reservation.expiresAt,
      },
    };
  } catch (error) {
    console.error('reserveCheckoutAction error:', error);
    const message =
      error instanceof Error ? error.message : 'Unable to reserve items';
    return { success: false as const, error: message };
  }
}

export async function releaseCheckoutReservationAction(reservationId: string) {
  try {
    const released = await releaseCheckoutReservation(reservationId);
    await clearReservationCookie();
    return { success: true as const, data: released };
  } catch (error) {
    console.error('releaseCheckoutReservationAction error:', error);
    const message = error instanceof Error ? error.message : 'Release failed';
    return { success: false as const, error: message };
  }
}

export async function markCheckoutPendingPaymentAction(reservationId: string) {
  try {
    await markCheckoutReservationPendingPayment(reservationId);
    return { success: true as const };
  } catch (error) {
    console.error('markCheckoutPendingPaymentAction error:', error);
    const message =
      error instanceof Error ? error.message : 'Reservation expired';
    return { success: false as const, error: message };
  }
}

export async function confirmCheckoutReservationAction(reservationId: string) {
  try {
    const confirmed = await confirmCheckoutReservation(reservationId);
    await clearReservationCookie();
    return { success: true as const, data: confirmed };
  } catch (error) {
    console.error('confirmCheckoutReservationAction error:', error);
    const message =
      error instanceof Error ? error.message : 'Unable to confirm reservation';
    return { success: false as const, error: message };
  }
}

export async function expireCheckoutAction(reservationId: string) {
  try {
    const user = await getCurrentUser();
    await releaseCheckoutReservation(reservationId);
    await clearReservationCookie();

    if (user) {
      await clearCart(user.id);
    }

    return { success: true as const };
  } catch (error) {
    console.error('expireCheckoutAction error:', error);
    const message =
      error instanceof Error ? error.message : 'Unable to expire checkout';
    return { success: false as const, error: message };
  }
}

export async function getCheckoutReservationIdFromCookie() {
  const store = await cookies();
  return store.get(RESERVATION_COOKIE)?.value;
}
