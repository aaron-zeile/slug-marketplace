import { describe, expect, it } from 'vitest';

import { prependReview } from '../src/app/items/[id]/reviewDisplayUtils';
import { Review } from '../src/item/review';

const reviewA: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: 'u1aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Alice' },
  rating: 4,
  content: 'Great pillow, super comfy.',
  created_at: '2026-05-01T12:00:00.000Z',
};

const reviewB: Review = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user: { id: 'u2bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Bob' },
  rating: 5,
  content: 'Loved it!',
  created_at: '2026-05-02T12:00:00.000Z',
};

describe('prependReview', () => {
  it('returns only the new review when prev is null', () => {
    expect(prependReview(null, reviewB)).toEqual([reviewB]);
  });

  it('prepends the new review when prev has items', () => {
    expect(prependReview([reviewA], reviewB)).toEqual([reviewB, reviewA]);
  });
});
