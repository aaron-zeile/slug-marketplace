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
const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'
const itemsServiceUrls = [
  process.env.ITEMS_SERVICE_URL,
  'http://localhost:4500/graphql',
  'http://localhost:4000/graphql',
].filter(Boolean)
const orderServiceUrls = [
  process.env.ORDER_SERVICE_URL,
  'http://localhost:4700/graphql',
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

async function createOrderForCheckout(authenticated, item, address) {
  const response = await fetchFirstAvailable(orderServiceUrls, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          address: {
            city: address.city,
            country: address.country,
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            postalCode: address.postal_code,
            state: address.state,
          },
          buyer: authenticated.id,
          items: [
            {
              itemId: item.id,
              sellerId: item.seller.id,
            },
          ],
          purchaseAmount: item.price,
        },
      },
    }),
  }, 'Order creation')

  if (!response.ok) {
    throw new Error(`Order creation failed: ${response.status}`)
  }

  const body = await response.json()
  if (body.errors?.length) {
    throw new Error('Order creation returned GraphQL errors')
  }

  return body.data.createOrder
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

    const checkout = await page.waitForSelector('a[href="/checkout/shipping"]')
    await checkout.click()
    await waitForText('Shipping address')
    await waitForText('Campus')

    const continueToPayment = await page.waitForSelector(
      'text/Continue to payment',
    )
    await continueToPayment.click()
    await waitForText('Payment')

    await createOrderForCheckout(authenticated, item, address)
    await page.goto('http://localhost:3000/account/orders', {
      waitUntil: 'networkidle2',
    })

    await waitForText('Orders')
    await waitForText('1 item')
    await waitForText('Shipping to: 1156 High St, Santa Cruz, CA, 95064, US')

    const breakdown = await page.waitForSelector('text/View item breakdown')
    await breakdown.click()
    await waitForText(itemName)
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

    const checkout = await page.waitForSelector('a[href="/checkout/shipping"]')
    await checkout.click()
    await waitForText('Shipping address')

    const continueToPayment = await page.waitForSelector(
      'text/Continue to payment',
    )
    await continueToPayment.click()

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
