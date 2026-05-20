import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app';
import { check, checkApiKey, createApiKey } from '../auth/service.js';
import { ListingService } from '../listings/service.js';

vi.mock('../auth/service.js', () => ({
  check: vi.fn(),
  checkApiKey: vi.fn(),
  createApiKey: vi.fn(),
}));

vi.mock('../listings/service.js', () => ({
  ListingService: vi.fn(),
}));

const mockCheck = vi.mocked(check);
const mockCheckApiKey = vi.mocked(checkApiKey);
const mockCreateApiKey = vi.mocked(createApiKey);
const MockListingService = vi.mocked(ListingService);

const sellerUser = {
  id: 'seller-123',
  email: 'seller@example.com',
  name: 'Seller Name',
};

const corporateAuth = {
  ...sellerUser,
  token: 'forwarded-session-token',
};

const listing = {
  id: 'item-123',
  seller: {
    id: sellerUser.id,
    name: sellerUser.name,
  },
  name: 'Corporate Listing',
  description: 'Created through the REST API',
  price: 19.99,
  created_at: '2026-05-17T00:00:00.000Z',
  images: ['https://example.com/image.jpg'],
};

function request(path: string, init?: RequestInit) {
  return new Promise<Response>((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const address = server.address();
        if (!address || typeof address === 'string') {
          throw new Error('Test server did not open a TCP port');
        }
        const response = await fetch(
          `http://127.0.0.1:${address.port}${path}`,
          init,
        );
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });
}

describe('seller corporate REST API', () => {
  const getListings = vi.fn();
  const createListing = vi.fn();
  const deleteListing = vi.fn();

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    vi.clearAllMocks();

    getListings.mockResolvedValue([listing]);
    createListing.mockResolvedValue(listing);
    deleteListing.mockResolvedValue(undefined);
    MockListingService.mockImplementation(() => ({
      getListings,
      createListing,
      deleteListing,
    } as unknown as ListingService));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects listing requests without browser auth or a corporate API key', async () => {
    const response = await request('/seller/api/listings?status=active');

    expect(response.status).toBe(401);
    expect(mockCheckApiKey).not.toHaveBeenCalled();
    expect(getListings).not.toHaveBeenCalled();
  });

  it('gets seller listings with a corporate API key', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth);

    const response = await request('/seller/api/listings?status=sold', {
      headers: {
        Authorization: 'Bearer slug_sk_test',
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ listings: [listing] });
    expect(mockCheckApiKey).toHaveBeenCalledWith('slug_sk_test');
    expect(getListings).toHaveBeenCalledWith(sellerUser.id, 'sold');
  });

  it('creates a listing with a corporate API key and forwards the session token to ItemsService', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth);

    const input = {
      name: 'Corporate Listing',
      description: 'Created through the REST API',
      price: 19.99,
      images: ['https://example.com/image.jpg'],
    };

    const response = await request('/seller/api/listings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer slug_sk_test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ listing });
    expect(createListing).toHaveBeenCalledWith(input, corporateAuth.token);
  });

  it('deletes a listing with a corporate API key and forwards the session token to ItemsService', async () => {
    mockCheckApiKey.mockResolvedValue(corporateAuth);

    const response = await request('/seller/api/listings/item-123', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer slug_sk_test',
      },
    });

    expect(response.status).toBe(204);
    expect(deleteListing).toHaveBeenCalledWith('item-123', corporateAuth.token);
  });

  it('rejects an invalid corporate API key', async () => {
    mockCheckApiKey.mockResolvedValue(undefined);

    const response = await request('/seller/api/listings', {
      headers: {
        Authorization: 'Bearer slug_sk_bad',
      },
    });

    expect(response.status).toBe(401);
    expect(getListings).not.toHaveBeenCalled();
  });

  it('creates a corporate API key for a browser-authenticated seller session', async () => {
    mockCheck.mockResolvedValue(sellerUser);
    mockCreateApiKey.mockResolvedValue({
      id: 'key-123',
      name: 'Bulk uploader',
      key: 'slug_sk_created',
      created_at: '2026-05-17T00:00:00.000Z',
    });

    const response = await request('/seller/api/keys', {
      method: 'POST',
      headers: {
        Cookie: 'session=browser-session-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Bulk uploader' }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: 'key-123',
      name: 'Bulk uploader',
      key: 'slug_sk_created',
      created_at: '2026-05-17T00:00:00.000Z',
    });
    expect(mockCheck).toHaveBeenCalledWith('browser-session-token');
    expect(mockCreateApiKey).toHaveBeenCalledWith(
      'browser-session-token',
      'Bulk uploader',
    );
  });
});
