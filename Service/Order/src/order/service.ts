import { createOrder, getBuyerOrders, getOrder, getSellerOrders } from './db';
import {
  BuyerOrdersInput,
  CreateOrderInput,
  Order,
  OrderIdInput,
  SellerOrdersInput,
} from './schema';

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

  public async getSellerOrders(input: SellerOrdersInput): Promise<Order[]> {
    return getSellerOrders(input);
  }
}
