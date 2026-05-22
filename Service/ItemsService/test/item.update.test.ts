import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import {
  createItemViaGraphql,
  expectGraphqlAuthError,
  mockUnauthenticatedLoginOnce,
  stubLoginFetch,
  testUser,
} from './helpers';
import supertest from 'supertest';

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

it('updates an owned item via GraphQL', async () => {
  const created = await createItemViaGraphql(server, {
    name: 'Before GraphQL Update',
    description: 'Original copy.',
    images: ['https://example.com/a.webp'],
    price: 10,
  });

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation UpdateItem($input: UpdateItem!) {
        updateItem(input: $input) {
          id
          name
          description
          price
        }
      }`,
      variables: {
        input: {
          id: created.id,
          name: 'After GraphQL Update',
          description: 'Updated copy.',
          images: ['https://example.com/b.webp'],
          price: 15,
        },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.updateItem).toMatchObject({
    id: created.id,
    name: 'After GraphQL Update',
    description: 'Updated copy.',
  });
});

it('rejects unauthenticated updateItem requests', async () => {
  const created = await createItemViaGraphql(server, {
    name: 'Protected Update',
    description: 'Cannot update without auth.',
    images: [],
    price: 5,
  });

  mockUnauthenticatedLoginOnce();

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation UpdateItem($input: UpdateItem!) {
        updateItem(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          id: created.id,
          name: 'Hijacked',
          description: 'Nope',
          images: [],
          price: 6,
        },
      },
    });

  expectGraphqlAuthError(response.body);
  expect(response.body.data?.updateItem).toBeUndefined();
});
