import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { post } from '../apiKeys/router.js';
import { createApiKey } from '../auth/service.js';

vi.mock('../auth/service.js', () => ({
  createApiKey: vi.fn(),
}));

const mockCreateApiKey = vi.mocked(createApiKey);

describe('api key router', () => {
  it('rejects API key creation when auth middleware did not set a user', async () => {
    const sendStatus = vi.fn();

    await post(
      { body: { name: 'Bulk uploader' } } as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('rejects API key creation when auth middleware did not set a session token', async () => {
    const sendStatus = vi.fn();

    await post(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        body: { name: 'Bulk uploader' },
      } as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('creates an API key when authenticated', async () => {
    const status = vi.fn(() => ({ json }));
    const json = vi.fn();
    const apiKey = {
      id: 'key-1',
      name: 'Bulk uploader',
      key: 'slug_sk_created',
      created_at: '2026-05-18T00:00:00.000Z',
    };
    mockCreateApiKey.mockResolvedValue(apiKey);

    await post(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        sessionToken: 'session-token',
        body: { name: 'Bulk uploader' },
      } as Request,
      { status } as unknown as Response,
    );

    expect(status).toHaveBeenCalledWith(201);
  });
});
