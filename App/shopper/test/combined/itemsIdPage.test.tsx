import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import ItemPage from '../../src/app/items/[id]/page';
import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('items/[id] page', () => {
  let itemId: string;
  let itemName: string;

  beforeAll(async () => {
    itemName = 'Combined Page Integration Item';
    const item = await seedItemsServiceItem({
      name: itemName,
      description: 'Rendered through the real item page.',
      images: ['https://example.com/combined-item.webp'],
      price: 77,
    });
    itemId = item.id;
    releaseFetchStubForServiceTests();
  });

  beforeEach(() => {
    setLoginCookieStoreForTest(async () => ({
      delete: () => {},
      get: () => undefined,
      set: () => {},
    }));
  });

  it('renders the seeded item from ItemsService', async () => {
    const tree = await ItemPage({
      params: Promise.resolve({ id: itemId }),
    });

    render(tree);

    await waitFor(() => {
      expect(screen.getByText(itemName)).toBeDefined();
    });
  });
});
