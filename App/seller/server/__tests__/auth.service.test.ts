import {beforeEach, describe, expect, it, vi} from 'vitest'
import {
  check,
  checkApiKey,
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from '../auth/service.js'

describe('auth service', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('returns the checked session user', async () => {
    const user = {
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Test Seller',
    }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => user,
    })

    const result = await check('session-token')

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
    }).toEqual({
      result: user,
      fetchCall: [
        'http://localhost:4010/api/v0/login/check',
        {
          headers: {
            Authorization: 'Bearer session-token',
          },
        },
      ],
    })
  })

  it('returns undefined when the login service rejects the session', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    })

    await expect(check('session-token')).resolves.toBeUndefined()
  })

  it('returns authenticated seller data for a valid API key', async () => {
    const authenticated = {
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Bulk uploader',
      token: 'forwarded-session-token',
    }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => authenticated,
    })

    const result = await checkApiKey('slug_sk_valid')

    expect(result).toEqual(authenticated)
  })

  it('returns undefined when the login service rejects an API key', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    })

    await expect(checkApiKey('slug_sk_bad')).resolves.toBeUndefined()
  })

  it('creates an API key through the login service', async () => {
    const apiKey = {
      id: 'key-1',
      name: 'Bulk uploader',
      key: 'slug_sk_created',
      created_at: '2026-05-18T00:00:00.000Z',
    }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => apiKey,
    })

    const result = await createApiKey('session-token', 'Bulk uploader')

    expect(result).toEqual(apiKey)
  })

  it('throws when API key creation fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
    })

    await expect(
      createApiKey('session-token', 'Bulk uploader'),
    ).rejects.toThrow('Failed to create API key: Unauthorized')
  })

  it('lists API keys through the login service', async () => {
    const keys = [
      {
        id: 'key-1',
        name: 'Bulk uploader',
        created_at: '2026-05-18T00:00:00.000Z',
      },
    ]
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => keys,
    })

    const result = await listApiKeys('session-token')

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
    }).toEqual({
      result: keys,
      fetchCall: [
        'http://localhost:4010/api/v0/corporate-keys',
        {
          headers: {
            Authorization: 'Bearer session-token',
          },
        },
      ],
    })
  })

  it('throws when API key listing fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
    })

    await expect(listApiKeys('session-token')).rejects.toThrow(
      'Failed to list API keys: Unauthorized',
    )
  })

  it('revokes an API key through the login service', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    })

    await revokeApiKey('session-token', 'key-1')

    expect(fetchMock.mock.calls[0]).toEqual([
      'http://localhost:4010/api/v0/corporate-keys/key-1',
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer session-token',
        },
      },
    ])
  })

  it('throws when API key revocation fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    })

    await expect(revokeApiKey('session-token', 'key-1')).rejects.toThrow(
      'Failed to revoke API key: Not Found',
    )
  })
})
