import 'reflect-metadata';
import { describe, expect, it } from 'vitest';

import type { ItemsGraphQLContext } from '../src/auth/context';
import { ItemResolver } from '../src/item/resolver';
import { ReviewResolver } from '../src/review/resolver';

const unauthenticatedContext: ItemsGraphQLContext = {
  headers: {},
  user: undefined,
};

describe('Resolver auth guards', () => {
  const itemResolver = new ItemResolver();
  const reviewResolver = new ReviewResolver();

  it('createItem throws Not authenticated when user is missing', async () => {
    await expect(
      itemResolver.createItem(
        {
          name: 'Guard Test',
          description: 'No session user.',
          images: [],
          price: 1,
        },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('updateItem throws Not authenticated when user is missing', async () => {
    await expect(
      itemResolver.updateItem(
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Guard Test',
          description: 'No session user.',
          images: [],
          price: 1,
        },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('deleteItem throws Not authenticated when user is missing', async () => {
    await expect(
      itemResolver.deleteItem(
        { id: '00000000-0000-0000-0000-000000000001' },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('createReview throws Not authenticated when user is missing', async () => {
    await expect(
      reviewResolver.createReview(
        {
          itemId: '00000000-0000-0000-0000-000000000001',
          rating: 5,
          comment: 'No session user.',
        },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('deleteReview throws Not authenticated when user is missing', async () => {
    await expect(
      reviewResolver.deleteReview(
        { id: '00000000-0000-0000-0000-000000000002' },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });
});
