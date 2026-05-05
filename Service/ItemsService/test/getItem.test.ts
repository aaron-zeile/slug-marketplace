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
  await db.reset();
  await bootstrap();
});

afterAll(() => {
  db.shutdown();
  server.close();
});
export async function getRequests(authToken: string | undefined) {
  const res = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + authToken)
    .send({
      query: `query getRequests{
              request{
                inbound{
                  id
                  name
                }
                outbound{
                  id
                  name
                }
              }
            }`,
    })
    .then((res) => {
      if (res.body.data) {
        console.log(res.body.data.request);
        return res.body.data.request;
      } else {
        return res.body.errors[0].message;
      }
    });
  return res;
}

test('Testing to pull 1 item', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `{item(input: { id: "30f0c3bc-4e76-4372-b6e6-5ca8d0ccd8e5" }) {
    id
    seller
    name
    description
    price
    created_at
  }}`,
    })
    .then((res) => {});
});
