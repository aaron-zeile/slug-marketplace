import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { pool } from '../src/db';
import { ItemService } from '../src/item/service';
import { testUser } from './helpers';
import { resetServiceDatabase, shutdownServiceDatabase } from './service.setup';

describe('ItemService', () => {
  beforeAll(async () => {
    await resetServiceDatabase();
  });

  afterAll(() => {
    shutdownServiceDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an item for the session seller', async () => {
    const input = {
      name: 'Service Test Item',
      description: 'Created via ItemService with a real database.',
      images: ['https://example.com/item.webp'],
      price: 19.99,
    };

    const created = await new ItemService().createItem(testUser, input);

    expect(created).toMatchObject({
      name: input.name,
      description: input.description,
      images: input.images,
      seller: { id: testUser.id, name: testUser.name },
      status: 'active',
    });
    expect(Number(created.price)).toBe(input.price);
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('throws when create item does not return a row', async () => {
    vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] });

    await expect(
      new ItemService().createItem(testUser, {
        name: 'Missing Row',
        description: 'Insert returned no rows.',
        images: [],
        price: 1,
      }),
    ).rejects.toThrow('Failed to create item');
  });

  it('returns an item by id', async () => {
    const created = await new ItemService().createItem(testUser, {
      name: 'Fetch By Id',
      description: 'Lookup test.',
      images: [],
      price: 5,
    });

    const item = await new ItemService().getItem({ id: created.id });

    expect(item.id).toBe(created.id);
    expect(item.name).toBe('Fetch By Id');
  });

  it('updates an owned item', async () => {
    const created = await new ItemService().createItem(testUser, {
      name: 'Before Update',
      description: 'Original.',
      images: ['https://example.com/a.webp'],
      price: 10,
    });

    const updated = await new ItemService().updateItem(testUser, {
      id: created.id,
      name: 'After Update',
      description: 'Updated.',
      images: ['https://example.com/b.webp'],
      price: 12,
    });

    expect(updated).toMatchObject({
      id: created.id,
      name: 'After Update',
      description: 'Updated.',
    });
    expect(Number(updated.price)).toBe(12);
  });

  it('throws when updating an item the seller does not own', async () => {
    const created = await new ItemService().createItem(testUser, {
      name: 'Protected',
      description: 'Cannot update.',
      images: [],
      price: 1,
    });

    await expect(
      new ItemService().updateItem(
        {
          ...testUser,
          id: '00000000-0000-0000-0000-000000000099',
        },
        {
          id: created.id,
          name: 'Hijacked',
          description: 'Nope',
          images: [],
          price: 2,
        },
      ),
    ).rejects.toThrow('Item not found or user does not own item');
  });

  it('deletes an owned item', async () => {
    const created = await new ItemService().createItem(testUser, {
      name: 'To Delete',
      description: 'Will be removed.',
      images: [],
      price: 3,
    });

    await expect(
      new ItemService().deleteItem(testUser, { id: created.id }),
    ).resolves.toBeUndefined();

    const item = await new ItemService().getItem({ id: created.id });
    expect(item).toBeUndefined();
  });

  it('throws when deleting an item the seller does not own', async () => {
    await expect(
      new ItemService().deleteItem(testUser, {
        id: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toThrow('Item not found or user does not own item');
  });

  it('throws when delete item returns no row count', async () => {
    vi.spyOn(pool, 'query').mockResolvedValueOnce({ rowCount: null, rows: [] });

    await expect(
      new ItemService().deleteItem(testUser, {
        id: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toThrow('Item not found or user does not own item');
  });

  it('returns seller items filtered by status', async () => {
    const created = await new ItemService().createItem(testUser, {
      name: 'Seller Listing',
      description: 'Active listing.',
      images: [],
      price: 8,
    });

    const items = await new ItemService().getSellerItems({
      id: testUser.id,
      status: 'active',
    });

    expect(items.map((item) => item.id)).toContain(created.id);
  });

  it('returns random items up to the requested count', async () => {
    await new ItemService().createItem(testUser, {
      name: 'Random A',
      description: 'A',
      images: [],
      price: 1,
    });
    await new ItemService().createItem(testUser, {
      name: 'Random B',
      description: 'B',
      images: [],
      price: 2,
    });

    const items = await new ItemService().getRandomItems({ count: 2 });

    expect(items.length).toBe(2);
  });

  it('returns items matching search text', async () => {
    await new ItemService().createItem(testUser, {
      name: 'Unique Searchable Lamp',
      description: 'Bright desk lamp.',
      images: [],
      price: 20,
    });

    const items = await new ItemService().getSearchItems({
      searchText: 'Unique Searchable',
    });

    expect(items.some((item) => item.name.includes('Unique Searchable'))).toBe(
      true,
    );
  });

  it('returns all items in the database', async () => {
    const before = await new ItemService().getAllItems();

    await new ItemService().createItem(testUser, {
      name: 'All Items Row',
      description: 'Listed in allItems.',
      images: [],
      price: 4,
    });

    const after = await new ItemService().getAllItems();

    expect(after.length).toBeGreaterThan(before.length);
  });
});
