import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createItem, deleteItembyID } = vi.hoisted(() => ({
  createItem: vi.fn(),
  deleteItembyID: vi.fn(),
}));

vi.mock('../src/item/db', () => ({
  createItem,
  deleteItembyID,
}));

import { ItemService } from '../src/item/service';
import { testUser } from './helpers';

describe('ItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createItem', () => {
    it('passes input and session seller to the database layer', async () => {
      const input = {
        name: 'Unit Test Item',
        description: 'Created via ItemService.',
        images: ['https://example.com/item.webp'],
        price: 19.99,
      };
      const created = {
        id: '00000000-0000-0000-0000-000000000099',
        ...input,
        seller: { id: testUser.id, name: testUser.name },
        created_at: new Date(),
      };

      createItem.mockResolvedValueOnce(created);

      await expect(new ItemService().createItem(testUser, input)).resolves.toEqual(
        created,
      );

      expect(createItem).toHaveBeenCalledWith({
        input,
        seller: { id: testUser.id, name: testUser.name },
      });
    });
  });

  describe('deleteItem', () => {
    it('throws when the item is not found or not owned by the seller', async () => {
      deleteItembyID.mockResolvedValueOnce(false);

      await expect(
        new ItemService().deleteItem(testUser, {
          id: '00000000-0000-0000-0000-000000000001',
        }),
      ).rejects.toThrow('Item not found or user does not own item');
    });
  });
});
