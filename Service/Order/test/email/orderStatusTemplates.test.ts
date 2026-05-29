import { describe, expect, it } from 'vitest';

import { buildOrderDeliveredEmail } from '../../src/email/orderDeliveredTemplate';
import { buildOrderShippedEmail } from '../../src/email/orderShippedTemplate';
import type { Order } from '../../src/order/schema';

const sampleOrder: Order = {
  id: '44444444-4444-4444-8444-444444444444',
  buyer: '11111111-1111-4111-8111-111111111111',
  items: [{ itemId: '33333333-3333-4333-8333-333333333333', sellerId: '22222222-2222-4222-8222-222222222222' }],
  orderedAt: new Date('2026-05-11T18:30:00.000Z'),
  purchaseAmount: 19.99,
  status: 'shipping',
  address: {
    line1: '1156 High Street',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
};

describe('status email templates', () => {
  it('builds shipped email content', () => {
    const email = buildOrderShippedEmail(sampleOrder);

    expect(email.subject).toContain('shipped');
    expect(email.html).toContain('Your order has shipped');
    expect(email.html).toContain('Shipped');
  });

  it('builds delivered email content', () => {
    const email = buildOrderDeliveredEmail({
      ...sampleOrder,
      status: 'delivered',
    });

    expect(email.subject).toContain('delivered');
    expect(email.html).toContain('Delivered');
  });
});
