'use server';

import { check, getSessionToken } from '../../server/auth/service';

interface OrderItemInput {
  itemId: string;
  sellerId: string;
}

interface OrderAddressInput {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderActionInput {
  items: OrderItemInput[];
  purchaseAmount: number;
  address: OrderAddressInput;
}

async function getCurrentUser() {
  const token = await getSessionToken();
  return token ? check(token) : undefined;
}

export async function createOrderAction(order: CreateOrderActionInput) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const createOrderInput = {
      buyer: user.id,
      items: order.items,
      purchaseAmount: order.purchaseAmount,
      address: order.address,
    };

    return { success: true, data: createOrderInput };
  } catch (error) {
    console.error('createOrderAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
