import { CartResolver } from './cart/resolver';
import { ViewedItemsResolver } from './viewed/resolver';
import { WishlistResolver } from './wishlist/resolver';

export const resolvers = [
  CartResolver,
  ViewedItemsResolver,
  WishlistResolver,
] as const;
