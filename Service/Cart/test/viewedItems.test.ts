import { expect, test } from 'vitest';
import supertest from 'supertest';

import { server } from './setup';

const member = '22222222-2222-4222-8222-222222222222';

function itemId(index: number) {
  return `11111111-1111-4111-8111-${index.toString().padStart(12, '0')}`;
}

async function recordViewedItem(item: string) {
  return supertest(server)
    .post('/graphql')
    .send({
      query: `mutation {
        recordViewedItem(input: {
          member: "${member}"
          item: "${item}"
        }) {
          member
          item
        }
      }`,
    });
}

test('records viewed items and returns most recent first', async () => {
  await recordViewedItem(itemId(1));
  await recordViewedItem(itemId(2));

  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        viewedItems(input: { member: "${member}" }) {
          member
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.viewedItems).toEqual([
        { member, item: itemId(2) },
        { member, item: itemId(1) },
      ]);
    });
});

test('re-viewing an item moves it to the front without duplicating it', async () => {
  await recordViewedItem(itemId(1));
  await recordViewedItem(itemId(2));
  await recordViewedItem(itemId(1));

  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        viewedItems(input: { member: "${member}" }) {
          item
        }
      }`,
    })
    .then((res) => {
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.viewedItems).toEqual([
        { item: itemId(1) },
        { item: itemId(2) },
      ]);
    });
});

test('keeps only the latest 100 viewed items for a member', async () => {
  for (let index = 1; index <= 101; index += 1) {
    await recordViewedItem(itemId(index));
  }

  await supertest(server)
    .post('/graphql')
    .send({
      query: `query {
        viewedItems(input: { member: "${member}" }) {
          item
        }
      }`,
    })
    .then((res) => {
      const viewedItems = res.body.data.viewedItems as { item: string }[];

      expect(res.body.errors).toBeUndefined();
      expect(viewedItems).toHaveLength(100);
      expect(viewedItems[0]).toEqual({ item: itemId(101) });
      expect(viewedItems).not.toContainEqual({ item: itemId(1) });
    });
});
