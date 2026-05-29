import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import {
  createItemViaGraphql,
  expectGraphqlAuthError,
  mockUnauthenticatedLoginOnce,
  stubLoginFetch,
  testUser,
} from './helpers';
import supertest from 'supertest';

vi.mock('../src/order/client', () => ({
  buyerHasOrderedItem: vi.fn().mockResolvedValue(true),
}));

import { buyerHasOrderedItem } from '../src/order/client';

const reviewComment = 'Great item, would buy again.';
const reviewRating = 4.5;

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
let testItemId: string;

beforeAll(async () => {
  stubLoginFetch();

  server = http.createServer(app);
  server.listen();
  await bootstrap();
  await db.resetSchema();

  const created = await createItemViaGraphql(server, {
    name: 'Juice',
    description: 'Refreshing fruit juice.',
    images: [],
    price: 3.56,
  });
  testItemId = created.id;
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

test('creates a review and returns it when fetching reviews', async () => {
  const createRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateReview($input: NewReview!) {
        createReview(input: $input) {
          id
          user {
            id
            name
          }
          content
          rating
          created_at
        }
      }`,
      variables: {
        input: {
          itemId: testItemId,
          rating: reviewRating,
          comment: reviewComment,
        },
      },
    });

  expect(createRes.body.errors).toBeUndefined();
  expect(createRes.body.data.createReview).toMatchObject({
    user: {
      id: testUser.id,
      name: testUser.name,
    },
    content: reviewComment,
    rating: reviewRating,
  });

  const createdReview = createRes.body.data.createReview;

  const reviewsRes = await supertest(server)
    .post('/graphql')
    .send({
      query: `query Reviews($input: ItemId!) {
        reviews(input: $input) {
          id
          user {
            id
            name
          }
          content
          rating
          created_at
        }
      }`,
      variables: {
        input: { id: testItemId },
      },
    });

  expect(reviewsRes.body.errors).toBeUndefined();
  expect(reviewsRes.body.data.reviews).toBeInstanceOf(Array);
  expect(reviewsRes.body.data.reviews).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: createdReview.id,
        user: {
          id: testUser.id,
          name: testUser.name,
        },
        content: reviewComment,
        rating: reviewRating,
      }),
    ]),
  );
});

test('createReview rejects users who have not purchased the item', async () => {
  vi.mocked(buyerHasOrderedItem).mockResolvedValueOnce(false);

  const otherItem = await createItemViaGraphql(server, {
    name: 'Unpurchased Juice',
    description: 'No order for this item.',
    images: [],
    price: 2.5,
  });

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateReview($input: NewReview!) {
        createReview(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          itemId: otherItem.id,
          rating: 4,
          comment: 'Not purchased.',
        },
      },
    });

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toContain(
    'You can only review items you have purchased',
  );
  expect(response.body.data?.createReview).toBeUndefined();
});

test('createReview rejects unauthenticated requests', async () => {
  mockUnauthenticatedLoginOnce();

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation CreateReview($input: NewReview!) {
        createReview(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
          itemId: testItemId,
          rating: 4,
          comment: 'No auth.',
        },
      },
    });

  expectGraphqlAuthError(response.body);
  expect(response.body.data?.createReview).toBeUndefined();
});
