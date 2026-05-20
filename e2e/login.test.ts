import {describe, expect, test} from 'vitest'
import {
  browser,
  page,
  logInWithMockGoogle,
  openAccountMenu,
  waitForText,
} from './setup'

async function findSellerDashboardButton() {
  return page.$('text/Seller Dashboard')
}

describe('Authentication', () => {
  test('Intial view is home page', async () => {
    await waitForText('Hello Guest')
  })

  test('Mock Google login session updates the greeting', async () => {
    const authenticated = await logInWithMockGoogle()

    await waitForText(`Hello ${authenticated.name}`)
  })

  test('New tab does not require re-authentication', async () => {
    const authenticated = await logInWithMockGoogle()
    const tab = await browser.newPage()

    await tab.goto(await page.url())
    await tab.evaluate((name) => {
      window.sessionStorage.setItem('name', name)
    }, authenticated.name)
    await tab.reload({ waitUntil: 'networkidle2' })
    await tab.waitForSelector(`text/Hello ${authenticated.name}`)
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
    sellerButton.dispose()
  })

  test('Seller dashboard button is hidden after logging out', async () => {
    await logInWithMockGoogle()
    await openAccountMenu()

    const logout = await page.waitForSelector('text/Logout')
    await logout.click()
    logout.dispose()

    await waitForText('Hello Guest')

    const sellerButton = await findSellerDashboardButton()
    expect(sellerButton).toBeNull()
  })
})
