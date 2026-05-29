import { describe, expect, it } from 'vitest';

import { buildOrderPurchasedEmail } from '../../src/email/orderPurchasedTemplate';
import type { Order } from '../../src/order/schema';

const sampleOrder: Order = {
  id: '44444444-4444-4444-8444-444444444444',
  buyer: '11111111-1111-4111-8111-111111111111',
  items: [
    { itemId: '33333333-3333-4333-8333-333333333333', sellerId: '22222222-2222-4222-8222-222222222222' },
    { itemId: '55555555-5555-4555-8555-555555555555', sellerId: '22222222-2222-4222-8222-222222222222' },
  ],
  orderedAt: new Date('2026-05-11T18:30:00.000Z'),
  purchaseAmount: 42.5,
  status: 'ordered',
  address: {
    label: 'Home',
    line1: '1156 High Street',
    line2: 'Apt 2',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
};

describe('buildOrderPurchasedEmail', () => {
  it('includes branded subject and structured html', () => {
    const email = buildOrderPurchasedEmail(sampleOrder);

    expect(email.subject).toContain('SlugMarketplace');
    expect(email.subject).toContain('$42.50');
    expect(email.html).toContain('Order confirmed');
    expect(email.html).toContain('44444444-4444-4444-8444-444444444444');
    expect(email.html).toContain('1156 High Street');
    expect(email.html).toContain('2 items');
    expect(email.text).toContain('Ship to:');
  });

  it('escapes html in address lines', () => {
    const email = buildOrderPurchasedEmail({
      ...sampleOrder,
      address: {
        ...sampleOrder.address,
        line1: '<script>alert(1)</script>',
      },
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });
});
