import { createHmac, randomUUID } from 'crypto'
import dotenv from 'dotenv'
import {describe, test} from 'vitest'
import {browser, page, waitForText} from './setup'

dotenv.config({ path: './Service/Login/.env' })

const authSecret =
  process.env.AUTH_SECRET ?? '0a1a55d9f089cad199acd651926bfda7'

function base64UrlEncode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function createSessionToken(user = {
  email: 'username@example.com',
  id: randomUUID(),
  name: 'username',
}) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' })
  const payload = base64UrlEncode({
    ...user,
    exp: now + 60 * 60,
    iat: now,
  })
  const signature = createHmac('sha256', authSecret)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}

async function logInAsMockUser() {
  await page.setCookie({
    httpOnly: true,
    name: 'session',
    path: '/',
    sameSite: 'Lax',
    url: 'http://localhost:3000',
    value: createSessionToken(),
  })
  await page.evaluate(() => {
    window.sessionStorage.setItem('name', 'username')
  })
  await page.reload({ waitUntil: 'networkidle2' })
}

describe('Authentication', () => {
  test('Intial view is home page', async () => {
    await waitForText('Hello Guest')
  })

  test('Mock Google login session updates the greeting', async () => {
    await logInAsMockUser()

    await waitForText('Hello username')
  })

  test('New tab does not require re-authentication', async () => {
    await logInAsMockUser()
    const tab = await browser.newPage()

    await tab.goto(await page.url(), { waitUntil: 'networkidle2' })
    await tab.evaluate(() => {
      window.sessionStorage.setItem('name', 'username')
    })
    await tab.reload({ waitUntil: 'networkidle2' })
    await tab.waitForSelector('text/Hello username')
    await tab.close()
  })
})
