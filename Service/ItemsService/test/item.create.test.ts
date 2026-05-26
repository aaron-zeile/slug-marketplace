import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
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

const newItem = {
  name: 'Ceramic Plant Pot',
  description: 'Handmade pot for indoor plants.',
  images: [
    'https://example.com/pot-front.webp',
    'https://example.com/pot-side.webp',
  ],
  price: 24.99,
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

describe('createItem', () => {
  it('returns the created item with seller from the authenticated session', async () => {
    const created = await createItemViaGraphql(server, newItem);

    expect(created).toMatchObject({
      name: newItem.name,
      description: newItem.description,
      images: newItem.images,
      price: newItem.price,
      quantity: 1,
      seller: {
        id: testUser.id,
        name: testUser.name,
      },
    });
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('persists the item so it can be fetched by id', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Persisted Widget',
      description: 'Stored in the database after create.',
      images: ['https://example.com/widget.webp'],
      price: 9.5,
    });

    const response = await supertest(server)
      .post('/graphql')
      .send({
        query: `query Item($input: ItemId!) {
          item(input: $input) {
            id
            name
            description
            images
            price
            quantity
            seller {
              id
              name
            }
          }
        }`,
        variables: { input: { id: created.id } },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.item).toEqual({
      id: created.id,
      name: created.name,
      description: created.description,
      images: created.images,
      price: created.price,
      quantity: 1,
      seller: created.seller,
    });
  });

  it('sets status to sold when created with zero quantity', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Out of Stock Widget',
      description: 'No inventory.',
      images: [],
      price: 1,
      quantity: 0,
    });

    expect(created).toMatchObject({
      quantity: 0,
      status: 'sold',
    });
  });

  it('persists a custom quantity when provided on create', async () => {
    const created = await createItemViaGraphql(server, {
      ...newItem,
      name: 'Limited Stock Widget',
      quantity: 7,
    });

    expect(created).toMatchObject({
      name: 'Limited Stock Widget',
      quantity: 7,
    });
  });

  it('lists the new item under sellerItems for the seller', async () => {
    const created = await createItemViaGraphql(server, {
      name: 'Seller Catalog Entry',
      description: 'Visible in seller listings.',
      images: [],
      price: 42,
    });

    const response = await supertest(server)
      .post('/graphql')
      .send({
        query: `query SellerItems($input: SellerItemsInput!) {
          sellerItems(input: $input) {
            id
            name
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
        }),
      ]),
    );
  });

  it('creates multiple items with distinct ids', async () => {
    const first = await createItemViaGraphql(server, {
      name: 'First Create',
      description: 'First of two items.',
      images: [],
      price: 1,
    });
    const second = await createItemViaGraphql(server, {
      name: 'Second Create',
      description: 'Second of two items.',
      images: [],
      price: 2,
    });

    expect(first.id).not.toBe(second.id);
    expect(first.name).not.toBe(second.name);
  });

  it('rejects unauthenticated requests', async () => {
    mockUnauthenticatedLoginOnce();

    const response = await supertest(server)
      .post('/graphql')
      .send({
        query: `mutation CreateItem($input: NewItem!) {
          createItem(input: $input) {
            id
          }
        }`,
        variables: {
          input: {
            name: 'No Auth Item',
            description: 'Should not be created.',
            images: [],
            price: 1,
          },
        },
      });

    expectGraphqlAuthError(response.body);
    expect(response.body.data?.createItem).toBeUndefined();
  });
});
