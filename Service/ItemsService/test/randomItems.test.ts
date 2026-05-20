import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import { createItemViaGraphql, stubLoginFetch } from './helpers';
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

  await createItemViaGraphql(server, {
    name: 'Random Item One',
    description: 'First seeded item for randomItems.',
    images: [],
    price: 10,
  });
  await createItemViaGraphql(server, {
    name: 'Random Item Two',
    description: 'Second seeded item for randomItems.',
    images: [],
    price: 20,
  });
  await createItemViaGraphql(server, {
    name: 'Random Item Three',
    description: 'Third seeded item for randomItems.',
    images: [],
    price: 30,
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

test('returns the requested number of random items', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `query RandomItems($input: RandomItemsInput!) {
        randomItems(input: $input) {
          name
        }
      }`,
      variables: {
        input: { count: 3 },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.randomItems).toHaveLength(3);
});
