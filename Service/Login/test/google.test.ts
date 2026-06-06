import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const googleAuth = vi.hoisted(() => {
  return {
    verifyIdToken: vi.fn(),
    clientConstructor: vi.fn(),
  }
})

vi.mock('google-auth-library', () => {
  class OAuth2Client {
    public verifyIdToken = googleAuth.verifyIdToken

    public constructor(clientId: string) {
      googleAuth.clientConstructor(clientId)
    }
  }

  return {
    OAuth2Client,
  }
})

import {
  setGoogleTokenVerifierForTest,
  verifyGoogleToken,
} from '../src/google'

const originalEnv = {
  e2eCredential: process.env.E2E_MOCK_GOOGLE_CREDENTIAL,
  e2eProfile: process.env.E2E_MOCK_GOOGLE_PROFILE,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  nextPublicGoogleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
}

beforeEach(() => {
  setGoogleTokenVerifierForTest(undefined)
  googleAuth.verifyIdToken.mockReset()
  googleAuth.clientConstructor.mockReset()
  delete process.env.E2E_MOCK_GOOGLE_CREDENTIAL
  delete process.env.E2E_MOCK_GOOGLE_PROFILE
  delete process.env.GOOGLE_CLIENT_ID
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
})

afterEach(() => {
  setGoogleTokenVerifierForTest(undefined)

  if (originalEnv.e2eCredential === undefined) {
    delete process.env.E2E_MOCK_GOOGLE_CREDENTIAL
  } else {
    process.env.E2E_MOCK_GOOGLE_CREDENTIAL = originalEnv.e2eCredential
  }

  if (originalEnv.e2eProfile === undefined) {
    delete process.env.E2E_MOCK_GOOGLE_PROFILE
  } else {
    process.env.E2E_MOCK_GOOGLE_PROFILE = originalEnv.e2eProfile
  }

  if (originalEnv.googleClientId === undefined) {
    delete process.env.GOOGLE_CLIENT_ID
  } else {
    process.env.GOOGLE_CLIENT_ID = originalEnv.googleClientId
  }

  if (originalEnv.nextPublicGoogleClientId === undefined) {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  } else {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      originalEnv.nextPublicGoogleClientId
  }
})

test('uses an injected verifier when one is configured for tests', async () => {
  setGoogleTokenVerifierForTest(async (token: string) => {
    return {
      email: `${token}@example.com`,
      name: 'Injected User',
      sub: 'injected-google-id',
    }
  })

  await expect(verifyGoogleToken('injected')).resolves.toEqual({
    email: 'injected@example.com',
    name: 'Injected User',
    sub: 'injected-google-id',
  })
  expect(googleAuth.verifyIdToken).not.toHaveBeenCalled()
})

test('accepts the default e2e mock Google credential', async () => {
  process.env.E2E_MOCK_GOOGLE_CREDENTIAL = 'mock-google-token'

  await expect(verifyGoogleToken('mock-google-token')).resolves.toEqual({
    email: 'username@example.com',
    name: 'username',
    sub: 'e2e-google-user',
  })
  expect(googleAuth.verifyIdToken).not.toHaveBeenCalled()
})

test('accepts a custom e2e mock Google profile', async () => {
  process.env.E2E_MOCK_GOOGLE_CREDENTIAL = 'custom-google-token'
  process.env.E2E_MOCK_GOOGLE_PROFILE = JSON.stringify({
    email: 'buyer@example.com',
    sub: 'custom-google-id',
  })

  await expect(verifyGoogleToken('custom-google-token')).resolves.toEqual({
    email: 'buyer@example.com',
    sub: 'custom-google-id',
  })
})

test('requires a Google client id when no test or e2e verifier matches', async () => {
  process.env.E2E_MOCK_GOOGLE_CREDENTIAL = 'different-token'

  await expect(verifyGoogleToken('real-google-token')).rejects.toThrow(
    'GOOGLE_CLIENT_ID is required',
  )
  expect(googleAuth.clientConstructor).not.toHaveBeenCalled()
})

test('verifies real Google tokens with the configured client id', async () => {
  process.env.GOOGLE_CLIENT_ID = 'server-client-id'
  googleAuth.verifyIdToken.mockResolvedValue({
    getPayload: () => {
      return {
        email: 'verified@example.com',
        name: 'Verified User',
        sub: 'verified-google-id',
      }
    },
  })

  await expect(verifyGoogleToken('real-google-token')).resolves.toEqual({
    email: 'verified@example.com',
    name: 'Verified User',
    sub: 'verified-google-id',
  })
  expect(googleAuth.clientConstructor).toHaveBeenCalledWith('server-client-id')
  expect(googleAuth.verifyIdToken).toHaveBeenCalledWith({
    idToken: 'real-google-token',
    audience: 'server-client-id',
  })
})

test('prefers NEXT_PUBLIC_GOOGLE_CLIENT_ID over GOOGLE_CLIENT_ID', async () => {
  process.env.GOOGLE_CLIENT_ID = 'server-client-id'
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'public-client-id'
  googleAuth.verifyIdToken.mockResolvedValue({
    getPayload: () => {
      return {
        email: 'verified@example.com',
        sub: 'verified-google-id',
      }
    },
  })

  await verifyGoogleToken('real-google-token')

  expect(googleAuth.clientConstructor).toHaveBeenCalledWith('public-client-id')
})

test('rejects verified Google tickets without a subject or email', async () => {
  process.env.GOOGLE_CLIENT_ID = 'server-client-id'
  googleAuth.verifyIdToken.mockResolvedValue({
    getPayload: () => {
      return {
        email: 'missing-sub@example.com',
      }
    },
  })

  await expect(verifyGoogleToken('real-google-token')).rejects.toThrow(
    'Invalid Google token',
  )
})
