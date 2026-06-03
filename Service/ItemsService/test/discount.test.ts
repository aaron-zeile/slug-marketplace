import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import supertest from 'supertest';

import { app, bootstrap } from '../src/app';
import * as db from './db';
import {
  createItemViaGraphql,
  expectGraphqlAuthError,
  mockUnauthenticatedLoginOnce,
  stubLoginFetch,
} from './helpers';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

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

test('createDiscount creates a discount and discountsByItem returns it', async () => {
  const item = await createItemViaGraphql(server, {
    name: 'GraphQL Discount Item',
    description: 'Discounted through GraphQL.',
    images: [],
    price: 30,
  });

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateDiscount($input: NewDiscount!) {
        createDiscount(input: $input) {
          id
          itemId
          discountPercent
          duration
          created_at
        }
      }`,
      variables: {
        input: {
          itemId: item.id,
          discountPercent: 20,
          duration: 10,
        },
      },
    });

  expect(createResponse.body.errors).toBeUndefined();
  expect(createResponse.body.data.createDiscount).toMatchObject({
    itemId: item.id,
    discountPercent: 20,
    duration: 10,
  });

  const listResponse = await supertest(server)
    .post('/graphql')
    .send({
      query: `query DiscountsByItem($input: ItemId!) {
        discountsByItem(input: $input) {
          id
          itemId
          discountPercent
          duration
        }
      }`,
      variables: {
        input: { id: item.id },
      },
    });

  expect(listResponse.body.errors).toBeUndefined();
  expect(listResponse.body.data.discountsByItem).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: createResponse.body.data.createDiscount.id,
        itemId: item.id,
        discountPercent: 20,
        duration: 10,
      }),
    ]),
  );
});

test('deleteDiscount removes an owned item discount', async () => {
  const item = await createItemViaGraphql(server, {
    name: 'GraphQL Delete Discount Item',
    description: 'Discount removed through GraphQL.',
    images: [],
    price: 45,
  });

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateDiscount($input: NewDiscount!) {
        createDiscount(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          itemId: item.id,
          discountPercent: 12.5,
          duration: 5,
        },
      },
    });

  expect(createResponse.body.errors).toBeUndefined();
  const discountId = createResponse.body.data.createDiscount.id;

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation DeleteDiscount($input: DiscountId!) {
        deleteDiscount(input: $input)
      }`,
      variables: {
        input: { id: discountId },
      },
    });

  expect(deleteResponse.body.errors).toBeUndefined();
  expect(deleteResponse.body.data.deleteDiscount).toBe(true);

  const getResponse = await supertest(server)
    .post('/graphql')
    .send({
      query: `query Discount($input: DiscountId!) {
        discount(input: $input) {
          id
        }
      }`,
      variables: {
        input: { id: discountId },
      },
    });

  expect(getResponse.body.errors).toBeUndefined();
  expect(getResponse.body.data.discount).toBeNull();
});

test('createDiscount rejects unauthenticated requests', async () => {
  const item = await createItemViaGraphql(server, {
    name: 'GraphQL Protected Discount Item',
    description: 'Cannot discount without auth.',
    images: [],
    price: 60,
  });

  mockUnauthenticatedLoginOnce();

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation CreateDiscount($input: NewDiscount!) {
        createDiscount(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          itemId: item.id,
          discountPercent: 20,
          duration: 10,
        },
      },
    });

  expectGraphqlAuthError(response.body);
  expect(response.body.data?.createDiscount).toBeUndefined();
});
