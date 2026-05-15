import { expect, test } from 'vitest';
import supertest from 'supertest';

import {server} from './setup';

const member = '22222222-2222-4222-8222-222222222222';
const item = '11111111-1111-4111-8111-111111111111';

test('Testing to remove one quantity from cart', async () => {
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
        removeFromCart(input: {
          member: "${member}"
          item: "${item}"
        })
      }`,
    });

  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        cart(input: { member: "${member}" }) {
          item
          quantity
        }
      }`,
    })
    .then((res) => {
      expect(res.body.data.cart).toEqual([
        {
          item,
          quantity: 1,
        },
      ]);
    });
});

test('Testing to delete cart item when removing the last quantity', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        removeFromCart(input: {
          member: "${member}"
          item: "${item}"
        })
      }`,
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
