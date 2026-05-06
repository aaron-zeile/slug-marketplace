import { OAuth2Client } from 'google-auth-library'

export interface GoogleProfile {
  email: string
  name?: string
  sub: string
}

function getGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID
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
