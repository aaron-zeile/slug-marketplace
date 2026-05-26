// import { AuthResolver } from './auth/resolver';
import { CheckoutReservationResolver } from './checkout/resolver';
import { ItemResolver } from './item/resolver';
import { ReviewResolver } from './review/resolver';

export const resolvers = [
  ItemResolver,
  ReviewResolver,
  CheckoutReservationResolver,
] as const;
