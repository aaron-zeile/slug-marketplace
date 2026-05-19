import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import { createItemViaGraphql, stubLoginFetch } from './helpers';
import supertest from 'supertest';

const newItem = {
  name: 'Plant Pot 405',
  description: 'A ceramic plant pot for indoor plants.',
  images: ['https://example.com/plant-pot.webp'],
  price: 14.92,
};

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
let createdItemId: string;

beforeAll(async () => {
  stubLoginFetch();

  server = http.createServer(app);
  server.listen();
  await bootstrap();
  await db.resetSchema();

  const created = await createItemViaGraphql(server, newItem);
  createdItemId = created.id;
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

test('returns an item by id after createItem', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query Item($input: ItemId!) {
        item(input: $input) {
          name
        }
      }`,
      variables: {
        input: { id: createdItemId },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.item).toEqual({
    name: newItem.name,
  });
});
