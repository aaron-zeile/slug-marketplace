import { OAuth2Client } from 'google-auth-library'

export interface GoogleProfile {
  email: string
  name?: string
  sub: string
}
type GoogleTokenVerifier = (token: string) => Promise<GoogleProfile>

let googleTokenVerifierForTest: GoogleTokenVerifier | undefined
const DEFAULT_E2E_GOOGLE_PROFILE: GoogleProfile = {
  email: 'username@example.com',
  name: 'username',
  sub: 'e2e-google-user',
}

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

function getE2eGoogleProfile(token: string): GoogleProfile | undefined {
  const expectedCredential = process.env.E2E_MOCK_GOOGLE_CREDENTIAL

  if (!expectedCredential || token !== expectedCredential) {
    return undefined
  }

  if (process.env.E2E_MOCK_GOOGLE_PROFILE) {
    return JSON.parse(process.env.E2E_MOCK_GOOGLE_PROFILE) as GoogleProfile
  }

  return DEFAULT_E2E_GOOGLE_PROFILE
}

export async function verifyGoogleToken(token: string): Promise<GoogleProfile> {
  if (googleTokenVerifierForTest) {
    return googleTokenVerifierForTest(token)
  }

  const e2eGoogleProfile = getE2eGoogleProfile(token)
  if (e2eGoogleProfile) {
    return e2eGoogleProfile
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
