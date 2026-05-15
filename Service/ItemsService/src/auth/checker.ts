import { AuthChecker } from 'type-graphql';

import type { ItemsGraphQLContext } from './context';
import { AuthService } from './service';

export const expressAuthChecker: AuthChecker<ItemsGraphQLContext> = async (
  { context },
  _roles,
) => {
  try {
    const authorization = AuthService.authorizationFromHeaders(context.headers);

    context.user = await new AuthService().check(authorization, _roles);
    return true;
  } catch {
    return false;
  }
};
