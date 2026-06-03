import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../../src/app/api/image/route';

const allowedImageUrl =
  'https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/1.webp';

function makeRequest(imageUrl?: string) {
  const query = imageUrl === undefined ? '' : `?url=${encodeURIComponent(imageUrl)}`;
  return new NextRequest(`http://localhost:3000/api/image${query}`);
}

describe('GET /api/image', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 400 when the url query param is missing', async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid image url' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the url is not allowed', async () => {
    const response = await GET(
      makeRequest('http://localhost:4000/private.png'),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid image url' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when the upstream response is not ok', async () => {
    fetchMock.mockResolvedValue(
      new Response('not found', { status: 404, statusText: 'Not Found' }),
    );

    const response = await GET(makeRequest(allowedImageUrl));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Upstream image request failed',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      allowedImageUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'image/*',
          'User-Agent': 'SlugMarketplace/1.0',
        }),
        redirect: 'follow',
      }),
    );
  });

  it('returns 400 when the upstream response is not an image', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const response = await GET(makeRequest(allowedImageUrl));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'URL did not return an image',
    });
  });

  it('returns the proxied image with cache headers on success', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71]);
    fetchMock.mockResolvedValue(
      new Response(bytes, {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );

    const response = await GET(makeRequest(allowedImageUrl));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400');

    const body = new Uint8Array(await response.arrayBuffer());
    expect(body).toEqual(bytes);
  });

  it('returns 502 when fetching the upstream image throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const response = await GET(makeRequest(allowedImageUrl));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch image',
    });
  });
});
