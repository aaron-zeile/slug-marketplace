import 'server-only';
import type { WishlistEntry, WishlistItem } from './index';
import { WishlistEntrySchema } from './index';
import { getItem } from '../item/service';

const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || 'http://localhost:4600/graphql';

async function cartRequest<T>(
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
    throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return body.data?.[dataKey] as T;
}

export async function getWishlist(member: string): Promise<WishlistEntry[]> {
  const query = `
    query GetWishlist($input: MemberWishlistInput!) {
      wishlist(input: $input) {
        id
        member
        item
        createdAt
      }
    }
  `;

  const wishlist = await cartRequest<unknown[]>(
    query,
    {
      input: { member },
    },
    'wishlist',
  );

  return WishlistEntrySchema.array().parse(wishlist);
}

export async function getWishlistItems(
  member: string,
): Promise<WishlistItem[]> {
  const wishlist = await getWishlist(member);
  return Promise.all(
    wishlist.map(async (wishlistEntry) => ({
      id: wishlistEntry.id,
      member: wishlistEntry.member,
      item: await getItem(wishlistEntry.item),
      createdAt: wishlistEntry.createdAt,
    })),
  );
}

export async function addToWishlist(
  member: string,
  item: string,
): Promise<WishlistEntry> {
  const query = `
    mutation AddToWishlist($input: AddToWishlistInput!) {
      addToWishlist(input: $input) {
        id
        member
        item
        createdAt
      }
    }
  `;

  const wishlistItem = await cartRequest<unknown>(
    query,
    {
      input: { member, item },
    },
    'addToWishlist',
  );

  return WishlistEntrySchema.parse(wishlistItem);
}

export async function removeFromWishlist(
  member: string,
  item: string,
): Promise<boolean> {
  const query = `
    mutation RemoveFromWishlist($input: RemoveFromWishlistInput!) {
      removeFromWishlist(input: $input)
    }
  `;

  return cartRequest<boolean>(
    query,
    {
      input: { member, item },
    },
    'removeFromWishlist',
  );
}

export async function clearWishlist(member: string): Promise<boolean> {
  const query = `
    mutation ClearWishlist($input: MemberWishlistInput!) {
      clearWishlist(input: $input)
    }
  `;

  return cartRequest<boolean>(
    query,
    {
      input: { member },
    },
    'clearWishlist',
  );
}
