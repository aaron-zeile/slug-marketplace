import 'server-only';
import { ItemSchema } from '../shared/item';
import { Item } from './index';

const ITEMS_SERVICE_URL =
  process.env.ITEMS_SERVICE_URL || 'http://items-service:4000/graphql';

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
      }
    }
  `;

  const response = await fetch(ITEMS_SERVICE_URL, {
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
