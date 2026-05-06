// Made with codex
import { describe, expect, it } from 'vitest'

import { buildGoogleAuthorizationUrl, mockGoogleProfile } from '../src/auth/google'

describe('Google OAuth helpers', () => {
  it('builds the Google authorization URL with openid profile scopes and state', () => {
    process.env.GOOGLE_CLIENT_ID = 'client-id.apps.googleusercontent.com'
    process.env.GOOGLE_REDIRECT_URI =
      'http://localhost:3000/api/auth/google/callback'

    const url = buildGoogleAuthorizationUrl(
      'http://localhost:3000',
      'state-value',
    )

    expect(url.origin).toBe('https://accounts.google.com')
    expect(url.searchParams.get('client_id')).toBe(
      'client-id.apps.googleusercontent.com',
    )
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/google/callback',
    )
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toBe('openid email profile')
    expect(url.searchParams.get('state')).toBe('state-value')
  })

  it('provides a deterministic local Google profile for browser tests', () => {
    expect(mockGoogleProfile()).toEqual({
      email: 'username@example.com',
      name: 'username',
      sub: 'mock-google-user',
    })
  })
})
