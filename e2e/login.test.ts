import dotenv from 'dotenv'
import {describe, expect, test} from 'vitest'
import {browser, page, waitForText} from './setup'

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
    name: string
    token: string
  }

  await page.setCookie({
    httpOnly: true,
    name: 'session',
    path: '/',
    sameSite: 'Lax',
    url: 'http://localhost:3000',
    value: authenticated.token,
  })
  await page.evaluate(() => {
    window.sessionStorage.setItem('name', 'username')
  })
  await page.reload({ waitUntil: 'networkidle2' })
}

async function openAccountMenu() {
  await page.click('[aria-label="Open account menu"]')
}

async function findSellerDashboardButton() {
  return page.$('text/Seller Dashboard')
}

describe('Authentication', () => {
  test('Intial view is home page', async () => {
    await waitForText('Hello Guest')
  })

  test('Mock Google login session updates the greeting', async () => {
    await logInWithMockGoogle()

    await waitForText('Hello username')
  })

  test('New tab does not require re-authentication', async () => {
    await logInWithMockGoogle()
    const tab = await browser.newPage()

    await tab.goto(await page.url(), { waitUntil: 'networkidle2' })
    await tab.evaluate(() => {
      window.sessionStorage.setItem('name', 'username')
    })
    await tab.reload({ waitUntil: 'networkidle2' })
    await tab.waitForSelector('text/Hello username')
    await tab.close()
  })

  test('Logged in user can go to seller dashboard from the account menu', async () => {
    await logInWithMockGoogle()
    await openAccountMenu()

    const sellerButton = await page.waitForSelector('text/Seller Dashboard')
    const href = await sellerButton.evaluate((element) =>
      element.closest('a')?.getAttribute('href'),
    )
    expect(
      href?.includes('/seller') || href?.startsWith('http://localhost:5173'),
    ).toBe(true)

    await sellerButton.evaluate((element) => {
      const link = element.closest('a')
      if (!link) {
        throw new Error('Seller dashboard button is not a link')
      }
      link.click()
    })
  })

  test('Seller dashboard button is hidden after logging out', async () => {
    await logInWithMockGoogle()
    await openAccountMenu()
    await page.click('text/Logout')

    await waitForText('Hello Guest')

    const sellerButton = await findSellerDashboardButton()
    expect(sellerButton).toBeNull()
  })
})
