import { CartResolver } from './cart/resolver';
import { WishlistResolver } from './wishlist/resolver';

export const resolvers = [CartResolver, WishlistResolver] as const;
