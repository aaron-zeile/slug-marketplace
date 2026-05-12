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
// MAKE SURE TO CREATE A REVIEW FIRST THEN STORE ITS ID, THEN USE THAT ID IN THE TEST BELOW
// also make sure to update the expected fields in the test below to match the reviews for the item you are testing

test('Testing to pull reviews for an item', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{reviews(input: { id: "cbab3d45-b993-49c7-89cd-b6adb2d0f899" }) {
        user {
          id
          name
        }
        content
        rating
        created_at
      }}`,
    })
    .then((res) => {
      console.log(res.body);
      expect(res.body.data.reviews).toBeInstanceOf(Array);
      expect(res.body.data.reviews[0]).toMatchObject({
        user: {
          id: expect.any(String),
          name: expect.any(String),
        },
        content: expect.any(String),
        rating: expect.any(Number),
        created_at: expect.any(String),
      });
    });
});
