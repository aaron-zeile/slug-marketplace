import { beforeEach, describe, expect, it, vi } from 'vitest'

const googleAuth = vi.hoisted(() => {
  return {
    OAuth2Client: vi.fn(),
    verifyIdToken: vi.fn(),
  }
})

vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: googleAuth.OAuth2Client.mockImplementation(function () {
      return {
        verifyIdToken: googleAuth.verifyIdToken,
      }
    }),
  }
})

import { verifyGoogleToken } from '../src/auth/google'

describe('Google auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'public-client-id'
    delete process.env.GOOGLE_CLIENT_ID
  })

  it('verifies a Google token and returns the profile', async () => {
    googleAuth.verifyIdToken.mockResolvedValue({
      getPayload: () => {
        return {
          email: 'molly@example.com',
          name: 'Molly',
          sub: 'google-id-1',
        }
      },
    })

    await expect(verifyGoogleToken('google-token')).resolves.toEqual({
      email: 'molly@example.com',
      name: 'Molly',
      sub: 'google-id-1',
    })
    expect(googleAuth.OAuth2Client).toHaveBeenCalledWith('public-client-id')
    expect(googleAuth.verifyIdToken).toHaveBeenCalledWith({
      audience: 'public-client-id',
      idToken: 'google-token',
    })
  })

  it('falls back to the server Google client id', async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    process.env.GOOGLE_CLIENT_ID = 'server-client-id'
    googleAuth.verifyIdToken.mockResolvedValue({
      getPayload: () => {
        return {
          email: 'molly@example.com',
          sub: 'google-id-1',
        }
      },
    })

    await verifyGoogleToken('google-token')

    expect(googleAuth.OAuth2Client).toHaveBeenCalledWith('server-client-id')
    expect(googleAuth.verifyIdToken).toHaveBeenCalledWith({
      audience: 'server-client-id',
      idToken: 'google-token',
    })
  })

  it('rejects a Google token without required user info', async () => {
    googleAuth.verifyIdToken.mockResolvedValue({
      getPayload: () => {
        return {
          email: 'missing-sub@example.com',
        }
      },
    })

    await expect(verifyGoogleToken('bad-google-token')).rejects.toThrow(
      'Invalid Google token',
    )
  })
})
