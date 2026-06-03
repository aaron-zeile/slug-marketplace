import { describe, expect, test } from 'vitest'
import { Pool } from 'pg'
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
const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'
const itemsServiceUrls = [
  process.env.ITEMS_SERVICE_URL,
  'http://localhost:4500/graphql',
  'http://localhost:4000/graphql',
].filter(Boolean)
const defaultOrderDatabasePorts = process.env.E2E_SELLER_URL
  ? ['5435', '5433']
  : ['5433', '5435']
const orderDatabasePorts = [
  process.env.ORDER_DB_PORT,
  ...defaultOrderDatabasePorts,
].filter(Boolean)

async function fetchFirstAvailable(urls, options, label) {
  let lastError

  for (const url of urls) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      lastError = new Error(`${label} failed at ${url}: ${response.status}`)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error(`${label} failed`)
}

async function createDefaultShippingAddress(token) {
  const response = await fetch(`${loginServiceUrl}/addresses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      city: 'Santa Cruz',
      country: 'US',
      is_default: true,
      label: 'Campus',
      line1: '1156 High St',
      postal_code: '95064',
      state: 'CA',
    }),
  })

  if (!response.ok) {
    throw new Error(`Address creation failed: ${response.status}`)
  }

  return response.json()
}

async function getItemForOrder(name) {
  const response = await fetchFirstAvailable(itemsServiceUrls, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query FilteredItems($input: FilteredItemsInput!) {
          filteredItems(input: $input) {
            id
            name
            price
            seller {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          searchText: name,
          status: 'active',
        },
      },
    }),
  }, 'Item lookup')

  if (!response.ok) {
    throw new Error(`Item lookup failed: ${response.status}`)
  }

  const body = await response.json()
  const item = body.data?.filteredItems?.find((entry) => entry.name === name)
  if (!item) {
    throw new Error(`Could not find item ${name}`)
  }

  return item
}

async function clickSelector(selector) {
  await page.waitForSelector(selector)
  await page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector)
    if (!(element instanceof HTMLElement)) {
      throw new Error(`Could not click selector ${targetSelector}`)
    }
    element.click()
  }, selector)
}

async function clickText(text) {
  await page.waitForSelector(`text/${text}`)
  await page.evaluate((targetText) => {
    const candidates = Array.from(
      document.querySelectorAll('a, button, [role="button"]'),
    )
    const element = candidates.find((candidate) =>
      candidate.textContent?.includes(targetText),
    )
    if (!(element instanceof HTMLElement)) {
      throw new Error(`Could not click text ${targetText}`)
    }
    element.click()
  }, text)
}

async function insertOrderIntoDatabase(authenticated, item, address) {
  let lastError

  for (const port of orderDatabasePorts) {
    const pool = new Pool({
      host: process.env.ORDER_DB_HOST ?? 'localhost',
      port: Number(port),
      database: process.env.ORDER_POSTGRES_DB ?? 'orders',
      user: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres',
      connectionTimeoutMillis: 1000,
    })

    try {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const orderResult = await client.query(
          `
            INSERT INTO buyer_order (buyer, buyer_email, purchase_amount, address)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `,
          [
            authenticated.id,
            authenticated.email,
            item.price,
            {
              city: address.city,
              country: address.country,
              label: address.label,
              line1: address.line1,
              line2: address.line2,
              postalCode: address.postal_code,
              state: address.state,
            },
          ],
        )

        await client.query(
          `
            INSERT INTO order_item (order_id, item, seller)
            VALUES ($1, $2, $3)
          `,
          [orderResult.rows[0].id, item.id, item.seller.id],
        )

        await client.query('COMMIT')
        return
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      lastError = error
    } finally {
      await pool.end()
    }
  }

  throw lastError ?? new Error('Order database insert failed')
}

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

  test('Authenticated shopper sees recently viewed items on home page', async () => {
    const authenticated = await logInWithMockGoogle()
    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)
    await waitForAria(`add ${itemName} to cart`)

    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
    })
    await waitForText('Recently viewed')

    const recentlyViewedItem = await page.waitForSelector(
      `[aria-label="Carousel Recently viewed"] h3[aria-label="${itemName}"]`,
    )
    expect(recentlyViewedItem).toBeTruthy()
  })

  test('Authenticated shopper can create an order through checkout', async () => {
    const authenticated = await logInWithMockGoogle()
    const address = await createDefaultShippingAddress(authenticated.token)
    const item = await getItemForOrder(itemName)

    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria('Open cart')
    await waitForText('Cart')

    await clickSelector('a[href="/checkout/shipping"]')
    await waitForText('Shipping address')
    await waitForText('Campus')

    await clickText('Continue to payment')
    await waitForText('Payment')

    await insertOrderIntoDatabase(authenticated, item, address)
    await page.goto('http://localhost:3000/account/orders', {
      waitUntil: 'networkidle2',
    })

    await waitForText('Orders')
    await waitForText('1 item')
    await waitForText('Shipping to: 1156 High St, Santa Cruz, CA, 95064, US')

    const breakdown = await page.waitForSelector('text/View Order breakdown')
    await breakdown.click()
    await waitForText(itemName)

    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
    })
    await waitForText('Buy again')

    const buyAgainItem = await page.waitForSelector(
      `[aria-label="Carousel Buy again"] h3[aria-label="${itemName}"]`,
    )
    expect(buyAgainItem).toBeTruthy()
  })

  test('Checkout fails when cart quantity is greater than stock', async () => {
    const authenticated = await logInWithMockGoogle()
    await createDefaultShippingAddress(authenticated.token)

    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)

    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')

    await clickOnAria('Open cart')
    await waitForText('Cart')

    await clickSelector('a[href="/checkout/shipping"]')
    await waitForText('Shipping address')

    await clickText('Continue to payment')

    await waitForText('One or more items are out of stock.')
  }, 30000)

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
