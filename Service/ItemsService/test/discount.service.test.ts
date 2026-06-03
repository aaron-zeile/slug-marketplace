import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { pool } from '../src/db';
import { DiscountService } from '../src/discount/service';
import { ItemService } from '../src/item/service';
import { testUser } from './helpers';
import { resetServiceDatabase, shutdownServiceDatabase } from './service.setup';

describe('DiscountService', () => {
  let itemId: string;

  beforeAll(async () => {
    await resetServiceDatabase();

    const item = await new ItemService().createItem(testUser, {
      name: 'Discounted Item',
      description: 'For discount service tests.',
      images: [],
      price: 20,
    });
    itemId = item.id;
  });

  afterAll(() => {
    shutdownServiceDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a discount for an owned item in the real database', async () => {
    const discount = await new DiscountService().createDiscount(testUser, {
      itemId,
      discountPercent: 15,
      duration: 7,
    });

    expect(discount).toMatchObject({
      itemId,
      discountPercent: 15,
      duration: 7,
    });
    expect(discount.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(discount.created_at).toBeInstanceOf(Date);
  });

  it('returns a discount by id', async () => {
    const created = await new DiscountService().createDiscount(testUser, {
      itemId,
      discountPercent: 25,
      duration: 14,
    });

    const discount = await new DiscountService().getDiscount({ id: created.id });

    expect(discount).toMatchObject({
      id: created.id,
      itemId,
      discountPercent: 25,
      duration: 14,
    });
  });

  it('returns discounts for an item', async () => {
    const created = await new DiscountService().createDiscount(testUser, {
      itemId,
      discountPercent: 10,
      duration: 3,
    });

    const discounts = await new DiscountService().getDiscountsByItem({
      id: itemId,
    });

    expect(discounts.map((discount) => discount.id)).toContain(created.id);
  });

  it('throws when creating a discount for an item the seller does not own', async () => {
    await expect(
      new DiscountService().createDiscount(
        {
          ...testUser,
          id: '00000000-0000-0000-0000-000000000099',
        },
        {
          itemId,
          discountPercent: 10,
          duration: 1,
        },
      ),
    ).rejects.toThrow('Item not found or user does not own item');
  });

  it('deletes a discount for an owned item', async () => {
    const discount = await new DiscountService().createDiscount(testUser, {
      itemId,
      discountPercent: 5,
      duration: 2,
    });

    await expect(
      new DiscountService().deleteDiscount(testUser, { id: discount.id }),
    ).resolves.toBeUndefined();

    await expect(
      new DiscountService().getDiscount({ id: discount.id }),
    ).resolves.toBeUndefined();
  });

  it('throws when deleting a discount for an item the seller does not own', async () => {
    const discount = await new DiscountService().createDiscount(testUser, {
      itemId,
      discountPercent: 5,
      duration: 2,
    });

    await expect(
      new DiscountService().deleteDiscount(
        {
          ...testUser,
          id: '00000000-0000-0000-0000-000000000099',
        },
        { id: discount.id },
      ),
    ).rejects.toThrow('Discount not found or user does not own item');
  });

  it('throws when delete discount returns no row count', async () => {
    vi.spyOn(pool, 'query').mockResolvedValueOnce({ rowCount: null, rows: [] });

    await expect(
      new DiscountService().deleteDiscount(testUser, {
        id: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toThrow('Discount not found or user does not own item');
  });
});
