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

test('Testing to pull 3 random items', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{randomItems(input: { count: 3 }) {
        name
      }}`,
    })
    .then((res) => {
      expect(res.body.data.randomItems).toHaveLength(3);
    });
});
