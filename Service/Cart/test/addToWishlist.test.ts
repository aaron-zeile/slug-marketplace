import { expect, test } from 'vitest';
import supertest from 'supertest';

import { server } from './setup';

const member = '22222222-2222-4222-8222-222222222222';
const item = '11111111-1111-4111-8111-111111111111';

test('Testing to add an item to wishlist', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        addToWishlist(input: {
          member: "${member}"
          item: "${item}"
        }) {
          member
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.addToWishlist).toEqual({
        member,
        item,
      });
    });
});

test('Testing to add the same item to wishlist again returns existing entry', async () => {
  await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        addToWishlist(input: {
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
        addToWishlist(input: {
          member: "${member}"
          item: "${item}"
        }) {
          member
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.addToWishlist).toEqual({
        member,
        item,
      });
    });
});
