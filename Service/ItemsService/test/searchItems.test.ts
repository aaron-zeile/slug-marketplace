import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import { createItemViaGraphql, stubLoginFetch } from './helpers';
import supertest from 'supertest';

const searchableItem = {
  name: 'Desk Lamp 405',
  description: 'Adjustable desk lamp for reading.',
  images: ['https://example.com/desk-lamp.webp'],
  price: 29.99,
};

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
  await createItemViaGraphql(server, searchableItem);
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

test('searches items by search text', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query SearchItems($input: SearchItemsInput!) {
        searchItems(input: $input) {
          name
        }
      }`,
      variables: {
        input: { searchText: 'Desk Lamp' },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.searchItems.length).toBeGreaterThan(0);
  expect(
    response.body.data.searchItems.every((item: { name: string }) =>
      item.name.includes('Desk Lamp'),
    ),
  ).toBe(true);
});

test('returns no items for blank search text', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query SearchItems($input: SearchItemsInput!) {
        searchItems(input: $input) {
          name
        }
      }`,
      variables: {
        input: { searchText: '   ' },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.searchItems).toEqual([]);
});
