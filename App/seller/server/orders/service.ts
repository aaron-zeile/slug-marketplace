import { z } from 'zod';
import { OrderSchema, type Order } from '../../shared/index.js';

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || 'http://localhost:4700/graphql';

const SELLER_ORDERS_QUERY = `
  query SellerOrders($input: SellerOrdersInput!) {
    sellerOrders(input: $input) {
      id
      buyer
      items {
        itemId
        sellerId
      }
      orderedAt
      purchaseAmount
      address {
        label
        line1
        line2
        city
        state
        postalCode
        country
      }
    }
  }
`;

interface SellerOrdersResponse {
  data?: {
    sellerOrders?: unknown
  }
  errors?: {
    message?: string
  }[]
}

export class OrderService {
  public async getOrders(sellerId: string): Promise<Order[]> {
    const response = await fetch(ORDER_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SELLER_ORDERS_QUERY,
        variables: {
          input: {
            seller: sellerId,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch seller orders: ${response.statusText}`);
    }

    const body = await response.json() as SellerOrdersResponse;

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = z.array(OrderSchema).safeParse(body.data?.sellerOrders);

    if (!parseResult.success) {
      throw new Error('Seller orders response did not match expected schema');
    }

    return parseResult.data;
  }
}
