import { OrderStatus } from './schema';

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.ORDERED]: OrderStatus.SHIPPING,
  [OrderStatus.SHIPPING]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: null,
};

export function assertValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
): void {
  if (NEXT_STATUS[current] !== next) {
    throw new Error(
      `Cannot change order status from ${current} to ${next}`,
    );
  }
}
