import 'server-only';
import { ActiveDiscountSchema, DiscountSchema, ItemSchema } from '../shared/item';
import { Item } from './index';

export interface FilteredItemsInput {
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  minStars?: number;
  sellerId?: string;
  status?: 'active' | 'sold';
  searchText?: string;
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'ratingDesc';
  limit?: number;
}

function itemsServiceUrl() {
  return process.env.ITEMS_SERVICE_URL || 'http://localhost:4000/graphql';
}

function applyDiscount(price: number, discountPercent: number) {
  return Math.max(0, Math.round(price * (100 - discountPercent)) / 100);
}

function withActiveDiscount(item: unknown, discounts: unknown): Item {
  const parsedItem = ItemSchema.parse(item);
  const parsedDiscounts = DiscountSchema.array().parse(discounts ?? []);
  const now = Date.now();
  const activeDiscount = parsedDiscounts
    .map((discount) => {
      const endsAt = new Date(discount.created_at).getTime() + discount.duration * 24 * 60 * 60 * 1000;
      return {
        ...discount,
        ends_at: new Date(endsAt).toISOString(),
        endsAt,
      };
    })
    .filter((discount) => discount.endsAt > now)
    .sort((a, b) => b.discountPercent - a.discountPercent || a.endsAt - b.endsAt)[0];

  return ItemSchema.parse({
    ...parsedItem,
    price: activeDiscount
      ? applyDiscount(parsedItem.price, activeDiscount.discountPercent)
      : parsedItem.price,
    activeDiscount: activeDiscount
      ? ActiveDiscountSchema.parse({
          id: activeDiscount.id,
          itemId: activeDiscount.itemId,
          discountPercent: activeDiscount.discountPercent,
          duration: activeDiscount.duration,
          created_at: activeDiscount.created_at,
          ends_at: activeDiscount.ends_at,
          originalPrice: parsedItem.price,
        })
      : null,
  });
}

export async function getItem(id: string): Promise<Item> {
  const query = `
    query GetItem($input: ItemId!) {
      item(input: $input) {
        id
        seller {
          id
          name
        }
        name
        description
        images
        price
        quantity
        created_at
        status
      }
    }
  `;

  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: { id },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch item: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return withActiveDiscount(body.data?.item, await getItemDiscounts(id));
}

async function getItemDiscounts(id: string): Promise<unknown[]> {
  const query = `
    query GetItemDiscounts($input: ItemId!) {
      discountsByItem(input: $input) {
        id
        itemId
        discountPercent
        duration
        created_at
      }
    }
  `;

  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: { id },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const body = await response.json();
  if (body.errors?.length) {
    return [];
  }

  return body.data?.discountsByItem ?? [];
}

export async function getRandomItems(count: number): Promise<Item[]> {
  const query = `
    query GetRandomItems($input: RandomItemsInput!) {
      randomItems(input: $input) {
        id
        seller {
          id
          name
        }
        name
        description
        images
        price
        quantity
        created_at
        status
      }
    }
  `;

  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: { count },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch random items: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  const parseResult = ItemSchema.array().parse(body.data?.randomItems);
  return parseResult;
}

export async function getSearchItems(searchText: string): Promise<Item[]> {
  const query = `
    query SearchItems($input: SearchItemsInput!) {
      searchItems(input: $input) {
        id
        seller {
          id
          name
        }
        name
        description
        images
        price
        quantity
        created_at
        status
      }
    }
  `;

  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: { searchText },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch search items: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  const parseResult = ItemSchema.array().parse(body.data?.searchItems);
  return parseResult;
}

export async function getFilteredItems(
  input: FilteredItemsInput,
): Promise<Item[]> {
  const query = `
    query FilteredItems($input: FilteredItemsInput!) {
      filteredItems(input: $input) {
        id
        seller {
          id
          name
        }
        name
        description
        images
        price
        quantity
        created_at
        status
      }
    }
  `;

  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch filtered items: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  const parseResult = ItemSchema.array().parse(body.data?.filteredItems);
  return parseResult;
}
