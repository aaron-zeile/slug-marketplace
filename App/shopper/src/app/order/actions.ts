'use server';

import { enrichOrdersWithDetails } from '../../order/enrich';
import { createOrder, getBuyerOrders } from '../../order/service';
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

    const createdOrder = await createOrder(createOrderInput);
    return { success: true, data: createdOrder };
  } catch (error) {
    console.error('createOrderAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchCurrentUserOrdersAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const orders = await getBuyerOrders(user.id);
    const ordersWithDetails = await enrichOrdersWithDetails(orders);
    return { success: true, data: ordersWithDetails };
  } catch (error) {
    console.error('fetchCurrentUserOrdersAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
