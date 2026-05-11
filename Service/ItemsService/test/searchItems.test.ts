import { beforeAll, afterAll, test, expect } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import supertest from 'supertest';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  await bootstrap();
  await db.reset();
});

afterAll(() => {
  db.shutdown();
  server.close();
});

test('searches items by search text', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{searchItems(input: { searchText: "Desk Lamp" }) {
        name
      }}`,
    })
    .then((res) => {
      expect(res.body.data.searchItems.length).toBeGreaterThan(0);
      expect(
        res.body.data.searchItems.every((item: { name: string }) =>
          item.name.includes('Desk Lamp'),
        ),
      ).toBe(true);
    });
});

test('returns no items for blank search text', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{searchItems(input: { searchText: "   " }) {
        name
      }}`,
    })
    .then((res) => {
      expect(res.body.data.searchItems).toEqual([]);
    });
});
