import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import * as http from 'http';
import * as db from './db';
import { app, bootstrap } from '../src/app';
import { createItemViaGraphql, stubLoginFetch } from './helpers';
import supertest from 'supertest';

const SECRET = 'dev-internal-secret';

vi.mock('../src/order/client', () => ({
  buyerHasOrderedItem: vi.fn().mockResolvedValue(true),
}));

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
let itemId: string;

beforeAll(async () => {
  stubLoginFetch();

  server = http.createServer(app);
  server.listen();
  await bootstrap();
  await db.resetSchema();

  const created = await createItemViaGraphql(server, {
    name: 'Admin Route Item',
    description: 'Used in admin route tests.',
    images: [],
    price: 12.5,
  });
  itemId = created.id;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateReview($input: NewReview!) {
        createReview(input: $input) { id }
      }`,
      variables: {
        input: { itemId, rating: 4, comment: 'Admin test review' },
      },
    });
});

afterAll(() => {
  vi.unstubAllGlobals();
  db.shutdown();
  server.close();
});

// ── GET /admin/items ─────────────────────────────────────────────────────────

test('GET /admin/items returns 403 without secret', async () => {
  const res = await supertest(server).get('/admin/items');
  expect(res.status).toBe(403);
});

test('GET /admin/items returns 403 with wrong secret', async () => {
  const res = await supertest(server)
    .get('/admin/items')
    .set('X-Admin-Secret', 'wrong-secret');
  expect(res.status).toBe(403);
});

test('GET /admin/items returns all items with correct secret', async () => {
  const res = await supertest(server)
    .get('/admin/items')
    .set('X-Admin-Secret', SECRET);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  const ids = res.body.map((item: { id: string }) => item.id);
  expect(ids).toContain(itemId);
});

// ── DELETE /admin/items/:id ──────────────────────────────────────────────────

test('DELETE /admin/items/:id returns 403 without secret', async () => {
  const res = await supertest(server).delete(`/admin/items/${itemId}`);
  expect(res.status).toBe(403);
});

test('DELETE /admin/items/:id returns 404 for non-existent item', async () => {
  const res = await supertest(server)
    .delete('/admin/items/00000000-0000-0000-0000-000000000000')
    .set('X-Admin-Secret', SECRET);
  expect(res.status).toBe(404);
});

test('DELETE /admin/items/:id removes the item', async () => {
  const toDelete = await createItemViaGraphql(server, {
    name: 'To Be Admin Deleted',
    description: 'Will be removed by admin.',
    images: [],
    price: 5,
  });

  const res = await supertest(server)
    .delete(`/admin/items/${toDelete.id}`)
    .set('X-Admin-Secret', SECRET);

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);

  const listRes = await supertest(server)
    .get('/admin/items')
    .set('X-Admin-Secret', SECRET);
  const ids = listRes.body.map((item: { id: string }) => item.id);
  expect(ids).not.toContain(toDelete.id);
});

// ── GET /admin/reviews ───────────────────────────────────────────────────────

test('GET /admin/reviews returns 403 without secret', async () => {
  const res = await supertest(server).get('/admin/reviews');
  expect(res.status).toBe(403);
});

test('GET /admin/reviews returns all reviews with correct secret', async () => {
  const res = await supertest(server)
    .get('/admin/reviews')
    .set('X-Admin-Secret', SECRET);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);

  const review = res.body[0];
  expect(review).toHaveProperty('id');
  expect(review).toHaveProperty('itemId');
  expect(review).toHaveProperty('itemName');
  expect(review).toHaveProperty('user');
  expect(review).toHaveProperty('content');
  expect(review).toHaveProperty('rating');
});

// ── DELETE /admin/reviews/:id ────────────────────────────────────────────────

test('DELETE /admin/reviews/:id returns 403 without secret', async () => {
  const res = await supertest(server).delete('/admin/reviews/some-id');
  expect(res.status).toBe(403);
});

test('DELETE /admin/reviews/:id returns 404 for non-existent review', async () => {
  const res = await supertest(server)
    .delete('/admin/reviews/00000000-0000-0000-0000-000000000000')
    .set('X-Admin-Secret', SECRET);
  expect(res.status).toBe(404);
});

test('DELETE /admin/reviews/:id removes the review', async () => {
  const createRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateReview($input: NewReview!) {
        createReview(input: $input) { id }
      }`,
      variables: {
        input: { itemId, rating: 3, comment: 'Review to be admin-deleted' },
      },
    });

  const reviewId = createRes.body.data.createReview.id;

  const res = await supertest(server)
    .delete(`/admin/reviews/${reviewId}`)
    .set('X-Admin-Secret', SECRET);

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);

  const listRes = await supertest(server)
    .get('/admin/reviews')
    .set('X-Admin-Secret', SECRET);
  const ids = listRes.body.map((r: { id: string }) => r.id);
  expect(ids).not.toContain(reviewId);
});
