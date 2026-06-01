import 'server-only';
import type { ViewedItem, ViewedItemEntry } from './index';
import { ViewedItemEntrySchema } from './index';
import { getItem } from '../item/service';

const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || 'http://localhost:4600/graphql';

async function viewedItemsRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  dataKey: string,
): Promise<T> {
  const response = await fetch(CART_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch viewed items: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return body.data?.[dataKey] as T;
}

export async function getViewedItems(
  member: string,
): Promise<ViewedItemEntry[]> {
  const query = `
    query GetViewedItems($input: MemberViewedItemsInput!) {
      viewedItems(input: $input) {
        id
        member
        item
        viewedAt
      }
    }
  `;

  const viewedItems = await viewedItemsRequest<unknown[]>(
    query,
    {
      input: { member },
    },
    'viewedItems',
  );

  return ViewedItemEntrySchema.array().parse(viewedItems);
}

export async function getViewedItemDetails(
  member: string,
): Promise<ViewedItem[]> {
  const viewedItems = await getViewedItems(member);
  return Promise.all(
    viewedItems.map(async (viewedItem) => ({
      id: viewedItem.id,
      member: viewedItem.member,
      item: await getItem(viewedItem.item),
      viewedAt: viewedItem.viewedAt,
    })),
  );
}

export async function recordViewedItem(
  member: string,
  item: string,
): Promise<ViewedItemEntry> {
  const query = `
    mutation RecordViewedItem($input: RecordViewedItemInput!) {
      recordViewedItem(input: $input) {
        id
        member
        item
        viewedAt
      }
    }
  `;

  const viewedItem = await viewedItemsRequest<unknown>(
    query,
    {
      input: { member, item },
    },
    'recordViewedItem',
  );

  return ViewedItemEntrySchema.parse(viewedItem);
}
