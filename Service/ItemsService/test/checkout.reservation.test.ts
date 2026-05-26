import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import { pool } from '../src/db';
import { createItemViaGraphql, stubLoginFetch } from './helpers';
import supertest from 'supertest';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

const buyerId = 'buyer-reservation-test';

beforeAll(async () => {
  stubLoginFetch();

  server = http.createServer(app);
  server.listen();
  await bootstrap();
  await db.resetSchema();
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

describe('checkout reservation', () => {
  it('reserves stock and releases it when the reservation is released', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Reservation Stock Item',
      description: 'Tracks quantity during checkout.',
      images: ['https://example.com/reserve.webp'],
      price: 10,
      quantity: 2,
    });

    const reserveResponse = await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation Reserve($input: ReserveCheckoutInput!) {
          reserveCheckout(input: $input) {
            id
            expiresAt
          }
        }`,
        variables: {
          input: {
            buyerId,
            items: [{ itemId: created.id, quantity: 1 }],
          },
        },
      });

    expect(reserveResponse.body.errors).toBeUndefined();
    const reservationId = reserveResponse.body.data.reserveCheckout.id as string;

    const afterReserve = await supertest(server)
      .post('/graphql')
      .send({
        query: `query Item($input: ItemId!) {
          item(input: $input) { quantity }
        }`,
        variables: { input: { id: created.id } },
      });

    expect(afterReserve.body.data.item.quantity).toBe(1);

    const reserveLastUnit = await createItemViaGraphql(server, {
      name: 'Last Unit Item',
      description: 'Becomes sold when reserved.',
      images: [],
      price: 3,
      quantity: 1,
    });

    await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation Reserve($input: ReserveCheckoutInput!) {
          reserveCheckout(input: $input) { id }
        }`,
        variables: {
          input: {
            buyerId,
            items: [{ itemId: reserveLastUnit.id, quantity: 1 }],
          },
        },
      });

    const soldItem = await supertest(server)
      .post('/graphql')
      .send({
        query: `query Item($input: ItemId!) {
          item(input: $input) { quantity status }
        }`,
        variables: { input: { id: reserveLastUnit.id } },
      });

    expect(soldItem.body.data.item).toEqual({ quantity: 0, status: 'sold' });

    const releaseResponse = await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation Release($input: CheckoutReservationIdInput!) {
          releaseCheckoutReservation(input: $input)
        }`,
        variables: { input: { id: reservationId } },
      });

    expect(releaseResponse.body.errors).toBeUndefined();
    expect(releaseResponse.body.data.releaseCheckoutReservation).toBe(true);

    const afterRelease = await supertest(server)
      .post('/graphql')
      .send({
        query: `query Item($input: ItemId!) {
          item(input: $input) { quantity }
        }`,
        variables: { input: { id: created.id } },
      });

    expect(afterRelease.body.data.item.quantity).toBe(2);
  });

  it('reserves when status is sold but quantity is still available', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Sold Label In Stock Item',
      description: 'Status sold with stock on hand.',
      images: [],
      price: 4,
      quantity: 41,
    });

    await pool.query(`UPDATE item SET status = 'sold' WHERE id = $1`, [
      created.id,
    ]);

    const reserveResponse = await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation Reserve($input: ReserveCheckoutInput!) {
          reserveCheckout(input: $input) { id }
        }`,
        variables: {
          input: {
            buyerId: 'another-buyer',
            items: [{ itemId: created.id, quantity: 30 }],
          },
        },
      });

    expect(reserveResponse.body.errors).toBeUndefined();

    const itemResponse = await supertest(server)
      .post('/graphql')
      .send({
        query: `query Item($input: ItemId!) {
          item(input: $input) { quantity status }
        }`,
        variables: { input: { id: created.id } },
      });

    expect(itemResponse.body.data.item).toEqual({
      quantity: 11,
      status: 'active',
    });
  });

  it('rejects reservation when stock is insufficient', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Low Stock Item',
      description: 'Only one left.',
      images: [],
      price: 5,
      quantity: 1,
    });

    const response = await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation Reserve($input: ReserveCheckoutInput!) {
          reserveCheckout(input: $input) { id }
        }`,
        variables: {
          input: {
            buyerId,
            items: [{ itemId: created.id, quantity: 2 }],
          },
        },
      });

    expect(response.body.errors?.length).toBeGreaterThan(0);
  });
});
