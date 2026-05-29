import 'server-only';

function orderServiceUrl() {
  return process.env.ORDER_SERVICE_URL || 'http://localhost:4700/graphql';
}

export interface CreateOrderInput {
  buyer: string;
  buyerEmail: string;
  items: {
    itemId: string;
    sellerId: string;
  }[];
  purchaseAmount: number;
  address: {
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface Order {
  id: string;
  buyer: string;
  items: {
    itemId: string;
    sellerId: string;
  }[];
  orderedAt: string;
  purchaseAmount: number;
  status: 'ordered' | 'shipping' | 'delivered';
  address: {
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const orderFields = `
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
`;

async function orderRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  dataKey: string,
): Promise<T> {
  const response = await fetch(orderServiceUrl(), {
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
    throw new Error(`Order request failed: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return body.data?.[dataKey] as T;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const query = `
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
        ${orderFields}
      }
    }
  `;

  return orderRequest<Order>(query, { input }, 'createOrder');
}

export async function buyerHasOrderedItem(
  buyer: string,
  itemId: string,
): Promise<boolean> {
  const query = `
    query BuyerHasOrderedItem($input: BuyerHasOrderedItemInput!) {
      buyerHasOrderedItem(input: $input)
    }
  `;

  return orderRequest<boolean>(
    query,
    {
      input: { buyer, itemId },
    },
    'buyerHasOrderedItem',
  );
}

export async function getBuyerOrders(buyer: string): Promise<Order[]> {
  const query = `
    query BuyerOrders($input: BuyerOrdersInput!) {
      buyerOrders(input: $input) {
        ${orderFields}
      }
    }
  `;

  return orderRequest<Order[]>(
    query,
    {
      input: { buyer },
    },
    'buyerOrders',
  );
}
