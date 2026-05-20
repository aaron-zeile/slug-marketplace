export interface SessionUser {
  id: string
  email: string
  name: string
}

export interface Authenticated extends SessionUser {
  token: string
}

export interface CorporateApiKeyCreated {
  id: string
  name: string
  key: string
  created_at: string
}

const LOGIN_SERVICE_URL = process.env.LOGIN_SERVICE_URL || 'http://localhost:4010/api/v0'

export async function check(token: string): Promise<SessionUser | undefined> {
  const response = await fetch(`${LOGIN_SERVICE_URL}/login/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    return undefined
  }
  return (await response.json()) as SessionUser
}

export async function checkApiKey(key: string): Promise<Authenticated | undefined> {
  const response = await fetch(`${LOGIN_SERVICE_URL}/corporate-keys/check`, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  })
  if (!response.ok) {
    return undefined
  }
  return (await response.json()) as Authenticated
}

export async function createApiKey(
  sessionToken: string,
  name: string,
): Promise<CorporateApiKeyCreated> {
  const response = await fetch(`${LOGIN_SERVICE_URL}/corporate-keys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create API key: ${response.statusText}`)
  }

  return (await response.json()) as CorporateApiKeyCreated
}
