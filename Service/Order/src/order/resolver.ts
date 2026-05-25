import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
  BuyerOrdersInput,
  CreateOrderInput,
  Order,
  OrderIdInput,
  SellerOrdersInput,
} from './schema';
import { OrderService } from './service';

@Resolver()
export class OrderResolver {
  @Query(() => Order)
  async order(@Arg('input') input: OrderIdInput): Promise<Order> {
    return new OrderService().getOrder(input);
  }

  @Query(() => [Order])
  async buyerOrders(@Arg('input') input: BuyerOrdersInput): Promise<Order[]> {
    return new OrderService().getBuyerOrders(input);
  }

  @Query(() => [Order])
  async sellerOrders(@Arg('input') input: SellerOrdersInput): Promise<Order[]> {
    return new OrderService().getSellerOrders(input);
  }

  @Mutation(() => Order)
  async createOrder(@Arg('input') input: CreateOrderInput): Promise<Order> {
    return new OrderService().createOrder(input);
  }
}
