import dotenv from 'dotenv'
import {describe, expect, test} from 'vitest'
import {baseUrl, browser, page} from './setup'

dotenv.config({ path: './Service/Login/.env' })

const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'

async function logInWithMockGoogle() {
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

  await page.setCookie({
    httpOnly: true,
    name: 'session',
    path: '/',
    sameSite: 'Lax',
    url: baseUrl,
    value: authenticated.token,
  })

  return authenticated
}

async function fetchSellerListingsStatus() {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  return page.evaluate(async () => {
    const response = await fetch('/seller/api/listings?status=active')
    return response.status
  })
}

describe('Authentication', () => {
  test('Seller listings endpoint is reachable', async () => {
    const status = await fetchSellerListingsStatus()

    expect(status).toBeLessThan(500)
  })

  test('Mock Google login uses real login service and seller API accepts the session', async () => {
    const authenticated = await logInWithMockGoogle()

    expect(authenticated.email).toBe('username@example.com')
    expect(authenticated.name).toBe('username')
    expect(authenticated.token).toEqual(expect.any(String))
    await expect(fetchSellerListingsStatus()).resolves.toBe(200)
  })

  test('New tab does not require re-authentication', async () => {
    await logInWithMockGoogle()
    const tab = await browser.newPage()

    await tab.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    const status = await tab.evaluate(async () => {
      const response = await fetch('/seller/api/listings?status=active')
      return response.status
    })
    expect(status).toBe(200)
    await tab.close()
  })
})
