import type { IncomingHttpHeaders } from 'http';

import type { SessionUser } from './service';

export interface ItemsGraphQLContext {
  headers: IncomingHttpHeaders;
  user?: SessionUser;
}
