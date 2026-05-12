// import { AuthResolver } from './auth/resolver';
import { ItemResolver } from './item/resolver';
import { ReviewResolver } from './review/resolver';

export const resolvers = [ItemResolver, ReviewResolver] as const;
