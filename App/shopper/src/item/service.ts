import 'server-only';
import { ItemSchema } from '../shared/item';
import { Item } from './index';

function itemsServiceUrl() {
  return process.env.ITEMS_SERVICE_URL || 'http://localhost:4000/graphql';
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

  const parseResult = ItemSchema.parse(body.data?.item);
  return parseResult;
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
