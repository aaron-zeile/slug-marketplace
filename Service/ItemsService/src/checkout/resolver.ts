import { Arg, Mutation, Resolver } from 'type-graphql';

import {
  CheckoutReservation,
  CheckoutReservationIdInput,
  ReserveCheckoutInput,
} from './schema';
import { CheckoutReservationService } from './service';

@Resolver()
export class CheckoutReservationResolver {
  @Mutation(() => CheckoutReservation)
  async reserveCheckout(
    @Arg('input') input: ReserveCheckoutInput,
  ): Promise<CheckoutReservation> {
    return new CheckoutReservationService().reserveCheckout(input);
  }

  @Mutation(() => Boolean)
  async releaseCheckoutReservation(
    @Arg('input') input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    return new CheckoutReservationService().releaseCheckout(input);
  }

  @Mutation(() => Boolean)
  async markCheckoutReservationPendingPayment(
    @Arg('input') input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    return new CheckoutReservationService().markPendingPayment(input);
  }

  @Mutation(() => Boolean)
  async confirmCheckoutReservation(
    @Arg('input') input: CheckoutReservationIdInput,
  ): Promise<boolean> {
    return new CheckoutReservationService().confirmCheckout(input);
  }
}
