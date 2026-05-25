import { createOrder, getBuyerOrders, getOrder } from './db';
import { BuyerOrdersInput, CreateOrderInput, Order, OrderIdInput } from './schema';

export class OrderService {
  public async createOrder(input: CreateOrderInput): Promise<Order> {
    return createOrder(input);
  }

  public async getOrder(input: OrderIdInput): Promise<Order> {
    return getOrder(input);
  }

  public async getBuyerOrders(input: BuyerOrdersInput): Promise<Order[]> {
    return getBuyerOrders(input);
  }
}
