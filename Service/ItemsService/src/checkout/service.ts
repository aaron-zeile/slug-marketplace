import {
  confirmCheckoutReservation,
  markCheckoutReservationPendingPayment,
  releaseCheckoutReservation,
  reserveCheckout,
} from './db';
import {
  CheckoutReservation,
  CheckoutReservationIdInput,
  ReserveCheckoutInput,
} from './schema';

export class CheckoutReservationService {
  public async reserveCheckout(
    input: ReserveCheckoutInput,
  ): Promise<CheckoutReservation> {
    if (input.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const reservation = await reserveCheckout(input.buyerId, input.items);
    return {
      id: reservation.id,
      expiresAt: reservation.expiresAt,
    };
  }

  public async releaseCheckout(
    input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    return releaseCheckoutReservation(input.id);
  }

  public async markPendingPayment(
    input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    const updated = await markCheckoutReservationPendingPayment(input.id);
    if (!updated) {
      throw new Error('Checkout reservation expired or is no longer active');
    }
    return true;
  }

  public async confirmCheckout(
    input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    return confirmCheckoutReservation(input.id);
  }
}
