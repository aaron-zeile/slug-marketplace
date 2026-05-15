import 'server-only';
import type { CartEntry, CartItem } from './index';
import { CartEntrySchema } from './index';
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
    throw new Error(`Failed to fetch cart: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return body.data?.[dataKey] as T;
}

export async function getCart(member: string): Promise<CartEntry[]> {
  const query = `
    query GetCart($input: MemberCartInput!) {
      cart(input: $input) {
        id
        member
        item
        quantity
      }
    }
  `;

  const cart = await cartRequest<unknown[]>(
    query,
    {
      input: { member },
    },
    'cart',
  );

  return CartEntrySchema.array().parse(cart);
}

export async function getCartItems(member: string): Promise<CartItem[]> {
  const cart = await getCart(member);
  return Promise.all(
    cart.map(async (cartEntry) => ({
      id: cartEntry.id,
      member: cartEntry.member,
      item: await getItem(cartEntry.item),
      quantity: cartEntry.quantity,
    })),
  );
}

export async function addToCart(
  member: string,
  item: string,
): Promise<CartEntry> {
  const query = `
    mutation AddToCart($input: AddToCartInput!) {
      addToCart(input: $input) {
        id
        member
        item
        quantity
      }
    }
  `;

  const cartItem = await cartRequest<unknown>(
    query,
    {
      input: { member, item },
    },
    'addToCart',
  );

  return CartEntrySchema.parse(cartItem);
}

export async function removeFromCart(
  member: string,
  item: string,
): Promise<boolean> {
  const query = `
    mutation RemoveFromCart($input: RemoveFromCartInput!) {
      removeFromCart(input: $input)
    }
  `;

  return cartRequest<boolean>(
    query,
    {
      input: { member, item },
    },
    'removeFromCart',
  );
}
