import { sendOrderDeliveredEmail } from '../email/orderDelivered';
import { sendOrderPurchasedEmail } from '../email/orderPurchased';
import { sendOrderShippedEmail } from '../email/orderShipped';
import {
  buyerHasOrderedItem as buyerHasOrderedItemDb,
  createOrder as createOrderDb,
  getBuyerOrders,
  getOrder,
  getSellerOrders,
  updateOrderStatusForSeller,
} from './db';
import {
  BuyerHasOrderedItemInput,
  BuyerOrdersInput,
  CreateOrderInput,
  Order,
  OrderIdInput,
  OrderStatus,
  SellerSalesStat,
  SellerOrdersInput,
  UpdateOrderStatusInput,
} from './schema';
import { assertValidStatusTransition } from './statusTransitions';

export class OrderService {
  public async createOrder(input: CreateOrderInput): Promise<Order> {
    const order = await createOrderDb(input);

    try {
      await sendOrderPurchasedEmail(order, input.buyerEmail);
    } catch (error) {
      console.error('[order-email] Failed to send purchase confirmation', error);
    }

    return order;
  }

  public async getOrder(input: OrderIdInput): Promise<Order> {
    return getOrder(input);
  }

  public async getBuyerOrders(input: BuyerOrdersInput): Promise<Order[]> {
    return getBuyerOrders(input);
  }

  public async getSellerOrders(input: SellerOrdersInput): Promise<Order[]> {
    return getSellerOrders(input);
  }

  public async getSellerSalesStats(
    input: SellerOrdersInput,
  ): Promise<SellerSalesStat[]> {
    const orders = await getSellerOrders(input);
    const byMonth = new Map<string, SellerSalesStat>();

    for (const order of orders) {
      const orderedAt = new Date(order.orderedAt);
      const key = `${orderedAt.getUTCFullYear()}-${String(
        orderedAt.getUTCMonth() + 1,
      ).padStart(2, '0')}`;
      const month = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        timeZone: 'UTC',
        year: 'numeric',
      }).format(orderedAt);
      const current = byMonth.get(key) ?? { month, earnings: 0, orders: 0 };

      current.earnings += order.purchaseAmount;
      current.orders += 1;
      byMonth.set(key, current);
    }

    return [...byMonth.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, stat]) => ({
        ...stat,
        earnings: Number(stat.earnings.toFixed(2)),
      }));
  }

  public async buyerHasOrderedItem(
    input: BuyerHasOrderedItemInput,
  ): Promise<boolean> {
    return buyerHasOrderedItemDb(input.buyer, input.itemId);
  }

  public async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const currentOrder = await getOrder({ id: input.orderId });

    assertValidStatusTransition(currentOrder.status, input.status);

    const { order, buyerEmail } = await updateOrderStatusForSeller(
      input.orderId,
      input.seller,
      input.status,
    );

    try {
      if (input.status === OrderStatus.SHIPPING) {
        await sendOrderShippedEmail(order, buyerEmail);
      } else if (input.status === OrderStatus.DELIVERED) {
        await sendOrderDeliveredEmail(order, buyerEmail);
      }
    } catch (error) {
      console.error('[order-email] Failed to send status notification', error);
    }

    return order;
  }
}
