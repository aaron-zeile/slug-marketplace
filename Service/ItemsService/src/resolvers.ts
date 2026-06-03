// import { AuthResolver } from './auth/resolver';
import { CheckoutReservationResolver } from './checkout/resolver';
import { DiscountResolver } from './discount/resolver';
import { ItemResolver } from './item/resolver';
import { ReviewResolver } from './review/resolver';

export const resolvers = [
  ItemResolver,
  ReviewResolver,
  DiscountResolver,
  CheckoutReservationResolver,
] as const;
