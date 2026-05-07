import { OAuth2Client } from 'google-auth-library'

export interface GoogleProfile {
  email: string
  name?: string
  sub: string
}
type GoogleTokenVerifier = (token: string) => Promise<GoogleProfile>

let googleTokenVerifierForTest: GoogleTokenVerifier | undefined

export function setGoogleTokenVerifierForTest(
  verifier: GoogleTokenVerifier | undefined,
) {
  googleTokenVerifierForTest = verifier
}

function getGoogleClientId() {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID

  if (!googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is required')
  }

  return googleClientId
}

export async function verifyGoogleToken(token: string): Promise<GoogleProfile> {
  if (googleTokenVerifierForTest) {
    return googleTokenVerifierForTest(token)
  }

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
