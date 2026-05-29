import 'server-only';

import { getItem } from '../item/service';
import type { Order } from './service';

export interface OrderLineItemDetail {
  itemId: string;
  sellerId: string;
  quantity: number;
  name: string;
  image?: string;
  price: number;
  unavailable?: boolean;
}

export type OrderWithDetails = Order & {
  lineItems: OrderLineItemDetail[];
};

async function resolveLineItem(
  line: Order['items'][number],
): Promise<OrderLineItemDetail> {
  try {
    const item = await getItem(line.itemId);
    return {
      itemId: line.itemId,
      sellerId: line.sellerId,
      quantity: 1,
      name: item.name,
      image: item.images[0],
      price: item.price,
    };
  } catch {
    return {
      itemId: line.itemId,
      sellerId: line.sellerId,
      quantity: 1,
      name: `Item ${line.itemId}`,
      price: 0,
      unavailable: true,
    };
  }
}

export async function enrichOrdersWithDetails(
  orders: Order[],
): Promise<OrderWithDetails[]> {
  const uniqueItemIds = [
    ...new Set(orders.flatMap((order) => order.items.map((line) => line.itemId))),
  ];

  const resolvedItems = new Map<string, OrderLineItemDetail>();
  await Promise.all(
    uniqueItemIds.map(async (itemId) => {
      const sampleLine = orders
        .flatMap((order) => order.items)
        .find((line) => line.itemId === itemId);

      if (!sampleLine) {
        return;
      }

      resolvedItems.set(itemId, await resolveLineItem(sampleLine));
    }),
  );

  return orders.map((order) => ({
    ...order,
    lineItems: Object.values(
      order.items.reduce<Record<string, OrderLineItemDetail>>((acc, line) => {
        const key = `${line.itemId}:${line.sellerId}`;
        const existing = acc[key];
        if (existing) {
          existing.quantity += 1;
          return acc;
        }

        const resolved = resolvedItems.get(line.itemId);
        if (!resolved) {
          acc[key] = {
            itemId: line.itemId,
            sellerId: line.sellerId,
            quantity: 1,
            name: `Item ${line.itemId}`,
            price: 0,
            unavailable: true,
          };
          return acc;
        }

        acc[key] = {
          ...resolved,
          itemId: line.itemId,
          sellerId: line.sellerId,
          quantity: 1,
        };
        return acc;
      }, {}),
    ),
  }));
}
