import 'reflect-metadata';
import { describe, expect, it } from 'vitest';

import type { ItemsGraphQLContext } from '../src/auth/context';
import { ReviewResolver } from '../src/review/resolver';

const unauthenticatedContext: ItemsGraphQLContext = {
  headers: {},
  user: undefined,
};

describe('ReviewResolver auth guards', () => {
  const resolver = new ReviewResolver();

  it('createReview throws Not authenticated when user is missing', async () => {
    await expect(
      resolver.createReview(
        {
          itemId: '00000000-0000-0000-0000-000000000001',
          rating: 5,
          comment: 'Great item.',
        },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('deleteReview throws Not authenticated when user is missing', async () => {
    await expect(
      resolver.deleteReview(
        { id: '00000000-0000-0000-0000-000000000002' },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });
});
