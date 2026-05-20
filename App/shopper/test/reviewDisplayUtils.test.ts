import { describe, expect, it } from 'vitest';

import {
  prependReview,
  removeReview,
} from '../src/app/items/[id]/reviewDisplayUtils';
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

describe('removeReview', () => {
  it('returns an empty array when prev is null', () => {
    expect(removeReview(null, reviewA.id)).toEqual([]);
  });

  it('removes the matching review and keeps others', () => {
    expect(removeReview([reviewA, reviewB], reviewA.id)).toEqual([reviewB]);
  });

  it('returns the same list when no id matches', () => {
    expect(removeReview([reviewA], reviewB.id)).toEqual([reviewA]);
  });
});
