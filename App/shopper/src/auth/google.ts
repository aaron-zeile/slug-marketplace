import { OAuth2Client } from 'google-auth-library'

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export interface GoogleProfile {
  email: string
  name?: string
  sub: string
}

function getGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID
}

function getGoogleRedirectUri(origin: string) {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    new URL('/api/auth/google/callback', origin).toString()
  )
}

export function buildGoogleAuthorizationUrl(origin: string, state: string) {
  const url = new URL(GOOGLE_AUTHORIZATION_URL)

  url.searchParams.set('client_id', getGoogleClientId() ?? '')
  url.searchParams.set('redirect_uri', getGoogleRedirectUri(origin))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)

  return url
}

export function mockGoogleProfile(): GoogleProfile {
  return {
    email: 'username@example.com',
    name: 'username',
    sub: 'mock-google-user',
  }
}

export async function verifyGoogleToken(token: string): Promise<GoogleProfile> {
  const googleClientId = getGoogleClientId()
  const googleClient = new OAuth2Client(googleClientId)
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  })

  const payload = ticket.getPayload()

  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google token')
  }

  return {
    email: payload.email,
    name: payload.name,
    sub: payload.sub,
  }
}
