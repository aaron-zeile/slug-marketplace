import { afterAll, beforeAll, expect, test, vi } from 'vitest';
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

const firstItem = {
  name: 'All Items One',
  description: 'First item for allItems.',
  images: ['https://example.com/one.webp'],
  price: 10,
};

const secondItem = {
  name: 'All Items Two',
  description: 'Second item for allItems.',
  images: ['https://example.com/two.webp'],
  price: 20,
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
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

test('allItems returns every item in the database', async () => {
  const createdOne = await createItemViaGraphql(server, firstItem);
  const createdTwo = await createItemViaGraphql(server, secondItem);

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query AllItems {
        allItems {
          id
          name
        }
      }`,
    });

  expect(response.body.errors).toBeUndefined();
  const names = response.body.data.allItems.map(
    (item: { name: string }) => item.name,
  );
  expect(names).toContain(createdOne.name);
  expect(names).toContain(createdTwo.name);
  expect(response.body.data.allItems.length).toBeGreaterThanOrEqual(2);
});

test('sellerItems returns items for the seller and status', async () => {
  const created = await createItemViaGraphql(server, {
    name: 'Seller Listing',
    description: 'Listed by the test seller.',
    images: [],
    price: 15,
  });

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query SellerItems($input: SellerItemsInput!) {
        sellerItems(input: $input) {
          id
          name
          seller {
            id
          }
        }
      }`,
      variables: {
        input: {
          id: testUser.id,
          status: 'active',
        },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.sellerItems).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: created.id,
        name: created.name,
        seller: { id: testUser.id },
      }),
    ]),
  );
});

test('filteredItems returns items matching optional filters', async () => {
  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateItem($input: NewItem!) {
        createItem(input: $input) {
          id
          name
          tags
        }
      }`,
      variables: {
        input: {
          name: 'GraphQL Filtered Camera',
          description: 'Unique item for filteredItems query.',
          images: [],
          tags: ['electronics', 'graphql-filter-tag'],
          price: 45,
        },
      },
    });

  expect(createResponse.body.errors).toBeUndefined();
  const created = createResponse.body.data.createItem;

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query FilteredItems($input: FilteredItemsInput!) {
        filteredItems(input: $input) {
          id
          name
          tags
        }
      }`,
      variables: {
        input: {
          minPrice: 40,
          maxPrice: 50,
          tag: 'graphql-filter-tag',
          searchText: 'Camera',
          sortBy: 'priceAsc',
          limit: 5,
        },
      },
    });

  expect(response.body.data.filteredItems).toEqual([
    expect.objectContaining({
      id: created.id,
      name: created.name,
      tags: expect.arrayContaining(['electronics', 'graphql-filter-tag']),
    }),
  ]);
});

test('deleteItem removes an item owned by the authenticated seller', async () => {
  const created = await createItemViaGraphql(server, {
    name: 'To Delete',
    description: 'Will be deleted.',
    images: [],
    price: 5,
  });

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation DeleteItem($input: ItemId!) {
        deleteItem(input: $input)
      }`,
      variables: {
        input: { id: created.id },
      },
    });

  expect(deleteResponse.body.errors).toBeUndefined();
  expect(deleteResponse.body.data.deleteItem).toBe(true);

  const sellerResponse = await supertest(server)
    .post('/graphql')
    .send({
      query: `query SellerItems($input: SellerItemsInput!) {
        sellerItems(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          id: testUser.id,
          status: 'active',
        },
      },
    });

  const ids = sellerResponse.body.data.sellerItems.map(
    (item: { id: string }) => item.id,
  );
  expect(ids).not.toContain(created.id);
});

test('deleteItem returns an error when the item does not exist', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation DeleteItem($input: ItemId!) {
        deleteItem(input: $input)
      }`,
      variables: {
        input: { id: '00000000-0000-0000-0000-000000000000' },
      },
    });

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toContain(
    'Item not found or user does not own item',
  );
  expect(response.body.data?.deleteItem).toBeUndefined();
});

test('deleteItem rejects unauthenticated requests', async () => {
  const created = await createItemViaGraphql(server, {
    name: 'Protected Item',
    description: 'Cannot delete without auth.',
    images: [],
    price: 12,
  });

  mockUnauthenticatedLoginOnce();

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation DeleteItem($input: ItemId!) {
        deleteItem(input: $input)
      }`,
      variables: {
        input: { id: created.id },
      },
    });

  expectGraphqlAuthError(response.body);
  expect(response.body.data?.deleteItem).toBeUndefined();
});
