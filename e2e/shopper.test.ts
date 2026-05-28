import { describe, expect, test } from 'vitest'
import {
  clickOnAria,
  logInWithMockGoogle,
  openAccountMenu,
  openItemByName,
  page,
  waitForAria,
  waitForText,
} from './setup'

const itemName = 'Juice'

describe('Shopper e2e interactions', () => {
  test('Guest add-to-cart prompts sign-in warning', async () => {
    await waitForText('Hello Guest')
    await openItemByName(itemName)
    await clickOnAria(`add ${itemName} to cart`)
    await waitForText('Please sign in to add to cart.')

    const warning = await page.waitForSelector(
      '[aria-label="Please sign in to add to cart."]',
    )
    expect(warning).toBeTruthy()
  })

  test('Authenticated shopper can checkout from cart', async () => {
    const authenticated = await logInWithMockGoogle()
    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria('Open cart')
    await waitForText('Cart')

    const checkout = await page.waitForSelector('text/Checkout')
    expect(checkout).toBeTruthy()
  })

  test('Account menu shows shipping addresses entry', async () => {
    await logInWithMockGoogle()
    await openAccountMenu()
    await waitForText('Shipping addresses')

    const menuItem = await page.waitForSelector('text/Shipping addresses')
    expect(menuItem).toBeTruthy()
  })

  test('Search submits and shows results for query', async () => {
    await waitForText('Hello Guest')
    await clickOnAria('Search')
    await page.keyboard.type(itemName)
    await clickOnAria('Submit search')
    await waitForAria(`Search Item ${itemName}`)

    const heading = await page.waitForSelector(
      `[aria-label="Search Item ${itemName}"] h2[aria-label="${itemName}"]`,
    )
    expect(heading).toBeTruthy()
  })
})
