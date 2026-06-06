import { z } from 'zod';
import {
  OrderSchema,
  SalesStatSchema,
  type Order,
  type SalesStat,
} from '../../shared/index.js';

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
      status
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

const SELLER_SALES_STATS_QUERY = `
  query SellerSalesStats($input: SellerOrdersInput!) {
    sellerSalesStats(input: $input) {
      month
      earnings
      orders
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
      console.error(
        '[seller-orders] GraphQL response failed schema validation',
        parseResult.error.flatten(),
      );
      throw new Error('Seller orders response did not match expected schema');
    }

    return parseResult.data;
  }

  public async getSalesStats(sellerId: string): Promise<SalesStat[]> {
    const response = await fetch(ORDER_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SELLER_SALES_STATS_QUERY,
        variables: {
          input: {
            seller: sellerId,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch seller sales stats: ${response.statusText}`);
    }

    const body = await response.json() as {
      data?: { sellerSalesStats?: unknown }
      errors?: { message?: string }[]
    };

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = z.array(SalesStatSchema).safeParse(
      body.data?.sellerSalesStats,
    );

    if (!parseResult.success) {
      console.error(
        '[seller-orders] Sales stats response failed schema validation',
        parseResult.error.flatten(),
      );
      throw new Error('Seller sales stats response did not match expected schema');
    }

    return parseResult.data;
  }

  public async updateOrderStatus(
    sellerId: string,
    orderId: string,
    status: 'shipping' | 'delivered',
  ): Promise<Order> {
    const graphQlStatus = status === 'shipping' ? 'SHIPPING' : 'DELIVERED';

    const response = await fetch(ORDER_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
            updateOrderStatus(input: $input) {
              id
              buyer
              items {
                itemId
                sellerId
              }
              orderedAt
              purchaseAmount
              status
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
        `,
        variables: {
          input: {
            orderId,
            seller: sellerId,
            status: graphQlStatus,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    const body = await response.json() as {
      data?: { updateOrderStatus?: unknown }
      errors?: { message?: string }[]
    };

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = OrderSchema.safeParse(body.data?.updateOrderStatus);

    if (!parseResult.success) {
      console.error(
        '[seller-orders] Updated order failed schema validation',
        parseResult.error.flatten(),
      );
      throw new Error('Updated order response did not match expected schema');
    }

    return parseResult.data;
  }
}
