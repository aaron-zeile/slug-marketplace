import dotenv from 'dotenv'
import { expect } from 'vitest'
import { page } from './setup'

dotenv.config({ path: './Service/Login/.env' })

const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'

export async function logInWithMockGoogle() {
  const response = await fetch(`${loginServiceUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({credential: 'e2e-google-token'}),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const authenticated = await response.json() as {
    email: string
    id: string
    name: string
    token: string
  }

  const sessionCheck = await fetch(`${loginServiceUrl}/login/check`, {
    headers: {
      Authorization: `Bearer ${authenticated.token}`,
    },
  })

  if (!sessionCheck.ok) {
    throw new Error(`Session check failed: ${sessionCheck.status}`)
  }

  const checkedUser = await sessionCheck.json() as {
    email: string
    id: string
    name: string
  }

  expect(checkedUser).toMatchObject({
    email: authenticated.email,
    id: authenticated.id,
    name: authenticated.name,
  })

  await page.setCookie({
    httpOnly: true,
    name: 'session',
    path: '/',
    sameSite: 'Lax',
    url: 'http://localhost:3000',
    value: authenticated.token,
  })
  await page.evaluate((name) => {
    window.sessionStorage.setItem('name', name)
  }, authenticated.name)
  await page.reload({ waitUntil: 'networkidle2' })

  return authenticated
}

export async function openAccountMenu() {
  await page.click('[aria-label="Open account menu"]')
}
