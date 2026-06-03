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

it('rejects invalid urls', () => {
  expect(isAllowedRemoteImageUrl('not-a-url')).toBe(false);
});

it('rejects non-http protocols', () => {
  expect(isAllowedRemoteImageUrl('ftp://example.com/image.png')).toBe(false);
});

it('blocks localhost urls', () => {
  expect(isAllowedRemoteImageUrl('http://localhost:4000/secret.png')).toBe(
    false,
  );
});

it('blocks loopback and private network hosts', () => {
  expect(isAllowedRemoteImageUrl('http://127.0.0.1/secret.png')).toBe(false);
  expect(isAllowedRemoteImageUrl('http://10.0.0.5/secret.png')).toBe(false);
  expect(
    isAllowedRemoteImageUrl('http://192.168.1.10/secret.png'),
  ).toBe(false);
  expect(
    isAllowedRemoteImageUrl('http://172.16.0.2/secret.png'),
  ).toBe(false);
});

it('builds a same-origin proxy path', () => {
  const remote =
    'https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/1.webp';
  expect(proxiedImageUrl(remote)).toBe(
    `/api/image?url=${encodeURIComponent(remote)}`,
  );
});

it('returns an empty string for empty urls', () => {
  expect(proxiedImageUrl('')).toBe('');
});

it('returns the original url when the remote host is not allowed', () => {
  const blocked = 'http://localhost:4000/secret.png';
  expect(proxiedImageUrl(blocked)).toBe(blocked);
});
