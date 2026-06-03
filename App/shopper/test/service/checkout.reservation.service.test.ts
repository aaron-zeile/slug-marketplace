import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  confirmCheckoutReservation,
  markCheckoutReservationPendingPayment,
  releaseCheckoutReservation,
  reserveCheckout,
} from '../../src/checkout/reservation/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
  testUser,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('checkout reservation service', () => {
  let itemId: string;
  let itemsServiceUrl: string;

  beforeAll(async () => {
    const created = await seedItemsServiceItem({
      name: 'Reservation Test Item',
      description: 'Stock reserved during checkout.',
      images: [],
      price: 25,
      quantity: 10,
    });
    itemId = created.id;
    itemsServiceUrl = process.env.ITEMS_SERVICE_URL!;
    releaseFetchStubForServiceTests();
  });

  afterEach(() => {
    process.env.ITEMS_SERVICE_URL = itemsServiceUrl;
  });

  it('reserves checkout stock for a buyer', async () => {
    const reservation = await reserveCheckout(testUser.id, [
      { itemId, quantity: 2 },
    ]);

    expect(reservation.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(new Date(reservation.expiresAt).getTime()).toBeGreaterThan(
      Date.now(),
    );

    await releaseCheckoutReservation(reservation.id);
  });

  it('marks a reservation pending payment and confirms it', async () => {
    const reservation = await reserveCheckout(testUser.id, [
      { itemId, quantity: 1 },
    ]);

    await expect(
      markCheckoutReservationPendingPayment(reservation.id),
    ).resolves.toBe(true);
    await expect(
      confirmCheckoutReservation(reservation.id),
    ).resolves.toBe(true);
  });

  it('releases a reservation and returns true', async () => {
    const reservation = await reserveCheckout(testUser.id, [
      { itemId, quantity: 1 },
    ]);

    await expect(
      releaseCheckoutReservation(reservation.id),
    ).resolves.toBe(true);
  });

  it('throws when the items service response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(
      reserveCheckout(testUser.id, [{ itemId, quantity: 1 }]),
    ).rejects.toThrow('Items service request failed: Bad Gateway');
  });

  it('throws GraphQL error message from the items service', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        errors: [{ message: 'Insufficient stock for one or more items' }],
      }),
    } as Response);

    await expect(
      reserveCheckout(testUser.id, [{ itemId, quantity: 999 }]),
    ).rejects.toThrow('Insufficient stock for one or more items');
  });

  it('throws a generic GraphQL error when the items service omits a message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        errors: [{}],
      }),
    } as Response);

    await expect(
      reserveCheckout(testUser.id, [{ itemId, quantity: 1 }]),
    ).rejects.toThrow('GraphQL error');
  });

  it('uses the default items service URL when ITEMS_SERVICE_URL is unset', async () => {
    const previousUrl = process.env.ITEMS_SERVICE_URL;
    delete process.env.ITEMS_SERVICE_URL;

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        data: {
          reserveCheckout: {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
          },
        },
      }),
    } as Response);

    try {
      await reserveCheckout(testUser.id, [{ itemId, quantity: 1 }]);
      expect(fetchSpy.mock.calls[0]?.[0]).toBe(
        'http://localhost:4000/graphql',
      );
    } finally {
      process.env.ITEMS_SERVICE_URL = previousUrl;
      fetchSpy.mockRestore();
      releaseFetchStubForServiceTests();
    }
  });
});
