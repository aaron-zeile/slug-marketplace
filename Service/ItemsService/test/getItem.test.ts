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

// MAKE SURE TO CREATE AN ITEM FIRST THEN STORE ITS ID, THEN USE THAT ID IN THE TEST BELOW
// also make sure to update the expected name in the test below to match the name of the item you created

test('Testing to pull 1 item', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{item(input: { id: "50f1033c-020a-4a3a-9544-d7f9f0f0ba4d" }) {
  name
}}`,
    })
    .then((res) => {
      console.log(res.body);
      expect(res.body.data.item).toEqual({
        name: 'Standing Desk 515',
      });
    });
});
