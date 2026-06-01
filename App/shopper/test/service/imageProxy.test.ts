import { expect, it } from 'vitest';

import {
  isAllowedRemoteImageUrl,
  proxiedImageUrl,
} from '../../src/lib/imageProxy';

it('allows public https image urls', () => {
  expect(
    isAllowedRemoteImageUrl(
      'https://plus.unsplash.com/premium_photo-1669750791963-ec6f3a565fb9?w=500',
    ),
  ).toBe(true);
});

it('blocks localhost urls', () => {
  expect(isAllowedRemoteImageUrl('http://localhost:4000/secret.png')).toBe(
    false,
  );
});

it('builds a same-origin proxy path', () => {
  const remote = 'https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/1.webp';
  expect(proxiedImageUrl(remote)).toBe(
    `/api/image?url=${encodeURIComponent(remote)}`,
  );
});
