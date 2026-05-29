import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { OrderStatus } from '../src/order/schema';
import { assertValidStatusTransition } from '../src/order/statusTransitions';

describe('assertValidStatusTransition', () => {
  it('allows ordered to shipping', () => {
    expect(() =>
      assertValidStatusTransition(OrderStatus.ORDERED, OrderStatus.SHIPPING),
    ).not.toThrow();
  });

  it('allows shipping to delivered', () => {
    expect(() =>
      assertValidStatusTransition(OrderStatus.SHIPPING, OrderStatus.DELIVERED),
    ).not.toThrow();
  });

  it('rejects skipping shipping', () => {
    expect(() =>
      assertValidStatusTransition(OrderStatus.ORDERED, OrderStatus.DELIVERED),
    ).toThrow(/Cannot change order status/);
  });

  it('rejects changing a delivered order', () => {
    expect(() =>
      assertValidStatusTransition(OrderStatus.DELIVERED, OrderStatus.SHIPPING),
    ).toThrow(/Cannot change order status/);
  });
});
