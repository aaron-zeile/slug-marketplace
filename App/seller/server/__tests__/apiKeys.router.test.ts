import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { get, post, remove } from '../apiKeys/router.js';
import { createApiKey, listApiKeys, revokeApiKey } from '../auth/service.js';

vi.mock('../auth/service.js', () => ({
  createApiKey: vi.fn(),
  listApiKeys: vi.fn(),
  revokeApiKey: vi.fn(),
}));

const mockCreateApiKey = vi.mocked(createApiKey);
const mockListApiKeys = vi.mocked(listApiKeys);
const mockRevokeApiKey = vi.mocked(revokeApiKey);

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

  it('lists API keys when authenticated', async () => {
    const json = vi.fn();
    mockListApiKeys.mockResolvedValue([
      {
        id: 'key-1',
        name: 'Bulk uploader',
        created_at: '2026-05-18T00:00:00.000Z',
      },
    ]);

    await get(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        sessionToken: 'session-token',
      } as Request,
      { json } as unknown as Response,
    );

    expect(json).toHaveBeenCalledWith({
      keys: [
        {
          id: 'key-1',
          name: 'Bulk uploader',
          created_at: '2026-05-18T00:00:00.000Z',
        },
      ],
    });
  });

  it('rejects API key listing when auth middleware did not set a user', async () => {
    const sendStatus = vi.fn();

    await get({} as Request, { sendStatus } as unknown as Response);

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('rejects API key listing when auth middleware did not set a session token', async () => {
    const sendStatus = vi.fn();

    await get(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
      } as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('revokes an API key when authenticated', async () => {
    const sendStatus = vi.fn();
    mockRevokeApiKey.mockResolvedValue(undefined);

    await remove(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        sessionToken: 'session-token',
        params: { id: 'key-1' },
      } as unknown as Request,
      { sendStatus } as unknown as Response,
    );

    expect({
      revokeCall: mockRevokeApiKey.mock.calls[0],
      statusCall: sendStatus.mock.calls[0],
    }).toEqual({
      revokeCall: ['session-token', 'key-1'],
      statusCall: [204],
    });
  });

  it('rejects API key revocation when auth middleware did not set a user', async () => {
    const sendStatus = vi.fn();

    await remove(
      { params: { id: 'key-1' } } as unknown as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('rejects API key revocation when auth middleware did not set a session token', async () => {
    const sendStatus = vi.fn();

    await remove(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        params: { id: 'key-1' },
      } as unknown as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(401);
  });

  it('rejects API key revocation without an id', async () => {
    const sendStatus = vi.fn();

    await remove(
      {
        user: {
          id: 'seller-1',
          email: 'seller@example.com',
          name: 'Seller',
        },
        sessionToken: 'session-token',
        params: {},
      } as unknown as Request,
      { sendStatus } as unknown as Response,
    );

    expect(sendStatus).toHaveBeenCalledWith(400);
  });
});
