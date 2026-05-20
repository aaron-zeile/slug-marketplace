import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { ItemsGraphQLContext } from '../src/auth/context';
import { ItemResolver } from '../src/item/resolver';

const unauthenticatedContext: ItemsGraphQLContext = {
  headers: {},
  user: undefined,
};

describe('ItemResolver auth guards', () => {
  const resolver = new ItemResolver();

  it('createItem throws Not authenticated when user is missing', async () => {
    await expect(
      resolver.createItem(
        {
          name: 'Widget',
          description: 'A test widget.',
          images: [],
          price: 9.99,
        },
        unauthenticatedContext,
      ),
    ).rejects.toThrow('Not authenticated');
  });

  it('deleteItem throws Not authenticated when user is missing', async () => {
    await expect(
      resolver.deleteItem({ id: '00000000-0000-0000-0000-000000000001' }, unauthenticatedContext),
    ).rejects.toThrow('Not authenticated');
  });
});
