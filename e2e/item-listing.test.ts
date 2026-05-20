import {describe, expect, test} from 'vitest'
import {page, waitForAria, waitForText} from './setup'

const itemCardSelector = '[aria-label^="Item Card "]'

async function waitForHomeItems() {
  await waitForText('Hello Guest')
  await page.waitForSelector(itemCardSelector, {timeout: 15000})
}

async function openFirstItemFromHome() {
  const card = await page.$(itemCardSelector)
  if (!card) {
    throw new Error('No item card found on home page')
  }

  const itemId = await card.evaluate((element) =>
    element.getAttribute('aria-label')?.replace('Item Card ', '').trim(),
  )
  if (!itemId) {
    throw new Error('Item card is missing an id in aria-label')
  }

  await card.click()
  await page.waitForFunction(
    (id) => window.location.pathname === `/items/${id}`,
    {timeout: 15000},
    itemId,
  )

  await page.waitForSelector('h1', {timeout: 15000})
  const itemName = await page.$eval('h1', (element) => element.textContent?.trim())
  if (!itemName) {
    throw new Error('Item listing page is missing a title')
  }

  return {itemId, itemName}
}

describe('Item listing', () => {
  test('home page shows item cards with prices', async () => {
    await waitForHomeItems()

    const priceOnCard = await page.$eval(itemCardSelector, (card) => {
      const textNodes = Array.from(card.querySelectorAll('*'))
        .map((element) => element.textContent?.trim() ?? '')
      return textNodes.find((text) => /^\$[\d,]+\.\d{2}$/.test(text))
    })

    expect(priceOnCard).toMatch(/^\$/)
  })

  test('clicking an item opens its listing with a price and add to cart', async () => {
    await waitForHomeItems()
    const {itemName} = await openFirstItemFromHome()

    const priceLabel = await page.$eval(
      '[role="group"][aria-label^="$"]',
      (element) => element.getAttribute('aria-label'),
    )
    expect(priceLabel).toMatch(/^\$\d+\.\d{2}$/)

    await page.waitForSelector(
      '[aria-label^="add "][aria-label$=" to cart"]',
      {timeout: 10000},
    )
    const addToCartLabel = await page.$eval(
      '[aria-label^="add "][aria-label$=" to cart"]',
      (element) => element.getAttribute('aria-label'),
    )
    expect(addToCartLabel).toBe(`add ${itemName} to cart`)

    await waitForAria('Main navigation')
  })
})
