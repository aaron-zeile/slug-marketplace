import {describe, expect, test} from 'vitest'
import {logInWithMockGoogle} from './auth'
import {page, waitForAria, waitForText} from './setup'

const itemCardSelector = '[aria-label^="Item Card "]'

describe('Shopping cart', () => {
  test('logged-in user can add an item and see it on the cart page', async () => {
    const authenticated = await logInWithMockGoogle()
    await waitForText(`Hello ${authenticated.name}`)

    await page.waitForSelector(itemCardSelector, {timeout: 15000})
    const card = await page.$(itemCardSelector)
    if (!card) {
      throw new Error('No item card found on home page')
    }

    await card.click()
    await page.waitForFunction(
      () => window.location.pathname.startsWith('/items/'),
      {timeout: 15000},
    )

    await page.waitForSelector('h1', {timeout: 15000})
    const itemName = await page.$eval('h1', (element) => element.textContent?.trim())
    if (!itemName) {
      throw new Error('Item listing page is missing a title')
    }

    await page.click('[aria-label^="add "][aria-label$=" to cart"]')
    await page.waitForSelector('[aria-label="Added to cart."]', {timeout: 10000})

    await page.click('[aria-label="Open cart"]')
    await page.waitForFunction(
      () => window.location.pathname === '/cart',
      {timeout: 15000},
    )

    await waitForText('Cart')
    await waitForText('1 item in your cart')
    await waitForAria(`Cart item ${itemName}`)

    const cartItemLabel = await page.$eval(
      '[aria-label^="Cart item "]',
      (element) => element.getAttribute('aria-label'),
    )
    expect(cartItemLabel).toBe(`Cart item ${itemName}`)
  })
})
