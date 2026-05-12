export interface SessionUser {
  id: string
  email: string
  name: string
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