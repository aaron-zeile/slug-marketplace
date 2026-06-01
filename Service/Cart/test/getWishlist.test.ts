import { expect, test } from 'vitest';
import supertest from 'supertest';

import { server } from './setup';

const member = '22222222-2222-4222-8222-222222222222';
const item = '11111111-1111-4111-8111-111111111111';

test('Testing to get wishlist items for a member', async () => {
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
      query: `query {
        wishlist(input: { member: "${member}" }) {
          member
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.wishlist).toEqual([
        {
          member,
          item,
        },
      ]);
    });
});
