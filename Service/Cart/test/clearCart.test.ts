import { expect, test } from 'vitest';
import supertest from 'supertest';

import {server} from './setup';

const member = '22222222-2222-4222-8222-222222222222';
const item = '11111111-1111-4111-8111-111111111111';
const secondItem = '33333333-3333-4333-8333-333333333333';

test('Testing to clear all cart items for a member', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        addToCart(input: {
          member: "${member}"
          item: "${item}"
        }) {
          id
        }
      }`,
    });

  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        addToCart(input: {
          member: "${member}"
          item: "${secondItem}"
        }) {
          id
        }
      }`,
    });

  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        clearCart(input: { member: "${member}" })
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.clearCart).toBe(true);
    });

  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        cart(input: { member: "${member}" }) {
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.cart).toEqual([]);
    });
});
