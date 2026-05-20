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

const reviewComment = 'Will be deleted.';
const reviewRating = 4;

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
    name: 'Review Delete Item',
    description: 'For delete review tests.',
    images: [],
    price: 9.99,
  });
  testItemId = created.id;
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

async function createReviewViaGraphql(): Promise<{ id: string }> {
  const createRes = await supertest(server)
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
          itemId: testItemId,
          rating: reviewRating,
          comment: reviewComment,
        },
      },
    });

  expect(createRes.body.errors).toBeUndefined();
  return createRes.body.data.createReview;
}

test('deleteReview removes a review owned by the authenticated user', async () => {
  const created = await createReviewViaGraphql();

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation DeleteReview($input: ReviewId!) {
        deleteReview(input: $input)
      }`,
      variables: {
        input: { id: created.id },
      },
    });

  expect(deleteResponse.body.errors).toBeUndefined();
  expect(deleteResponse.body.data.deleteReview).toBe(true);

  const reviewsRes = await supertest(server)
    .post('/graphql')
    .send({
      query: `query Reviews($input: ItemId!) {
        reviews(input: $input) {
          id
        }
      }`,
      variables: {
        input: { id: testItemId },
      },
    });

  const ids = reviewsRes.body.data.reviews.map(
    (review: { id: string }) => review.id,
  );
  expect(ids).not.toContain(created.id);
});

test('deleteReview returns an error when the review does not exist', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation DeleteReview($input: ReviewId!) {
        deleteReview(input: $input)
      }`,
      variables: {
        input: { id: '00000000-0000-0000-0000-000000000000' },
      },
    });

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toContain(
    'Review not found or user does not own review',
  );
  expect(response.body.data?.deleteReview).toBeUndefined();
});

test('deleteReview rejects unauthenticated requests', async () => {
  const created = await createReviewViaGraphql();

  mockUnauthenticatedLoginOnce();

  const response = await supertest(server)
    .post('/graphql')
    .send({
      query: `mutation DeleteReview($input: ReviewId!) {
        deleteReview(input: $input)
      }`,
      variables: {
        input: { id: created.id },
      },
    });

  expectGraphqlAuthError(response.body);
  expect(response.body.data?.deleteReview).toBeUndefined();
});
