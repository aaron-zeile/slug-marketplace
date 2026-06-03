import { describe, expect, test } from 'vitest'
import {
  clickOnAria,
  logInWithMockGoogle,
  openItemByName,
  page,
  waitForAria,
  waitForText,
} from './setup'

const sellerUrl = process.env.E2E_SELLER_URL ?? 'http://localhost:3000/seller'
const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'
const cartServiceUrl =
  process.env.CART_SERVICE_URL ?? 'http://localhost:4600/graphql'
const listingImageUrl =
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&fit=crop'

async function replaceText(selector: string, value: string) {
  await page.click(selector)
  await page.keyboard.down('Control')
  await page.keyboard.press('A')
  await page.keyboard.up('Control')
  await page.type(selector, value)
}

async function clickText(text: string) {
  await page.waitForSelector(`text/${text}`)
  await page.evaluate((targetText) => {
    const candidates = Array.from(
      document.querySelectorAll('a, button, [role="button"], [role="option"]'),
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

async function createDefaultShippingAddress(token: string) {
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
      label: 'Discount Test',
      line1: '1156 High St',
      postal_code: '95064',
      state: 'CA',
    }),
  })

  if (!response.ok) {
    throw new Error(`Address creation failed: ${response.status}`)
  }
}

async function clearCart(member: string) {
  const response = await fetch(cartServiceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation ClearCart($input: MemberCartInput!) {
          clearCart(input: $input)
        }
      `,
      variables: {
        input: { member },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Cart clear failed: ${response.status}`)
  }

  const body = await response.json()
  if (body.errors?.length) {
    throw new Error(`Cart clear failed: ${body.errors[0]?.message}`)
  }
}

async function createListing(name: string) {
  await page.goto(sellerUrl, { waitUntil: 'networkidle2' })

  await page.waitForSelector('text/Create Listing')
  await page.click('text/Create Listing')

  await page.click('aria/Name')
  await page.type('aria/Name', name)
  await page.click('aria/Description')
  await page.type('aria/Description', 'E2E discount checkout item')
  await page.click('aria/Price')
  await page.type('aria/Price', '100')
  await page.click('aria/Quantity')
  await page.type('aria/Quantity', '3')
  await page.click('aria/Image URLs')
  await page.type('aria/Image URLs', listingImageUrl)

  await page.click('form button[type="submit"]')
  await page.waitForSelector(`text/Created ${name}.`)
}

async function createDiscountForListing(name: string) {
  await page.click('text/Discounts')
  await waitForText('Discount Hub')

  await page.click('[role="combobox"][aria-labelledby^="discount-listing-label"]')
  await clickText(name)

  await replaceText('::-p-aria(Discount %)', '25')
  await replaceText('::-p-aria(Duration in days)', '2')

  await page.click('form button[type="submit"]')
  await page.waitForSelector(`text/Discount created for ${name}.`)
}

describe('Discount checkout e2e', () => {
  test('Seller discount changes shopper payment price', async () => {
    const authenticated = await logInWithMockGoogle()
    const name = `Discount E2E ${Date.now()}`

    await Promise.all([
      createDefaultShippingAddress(authenticated.token),
      clearCart(authenticated.id),
    ])

    await createListing(name)
    await createDiscountForListing(name)

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' })
    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(name)

    await waitForAria('$75.00')
    await waitForText('Sale 25% off')
    await clickOnAria(`add ${name} to cart`)
    await waitForAria('Added to cart.')

    await clickOnAria('Open cart')
    await waitForText('Cart')
    await waitForText('$75.00')
    await waitForText('$100.00')

    await page.click('a[href="/checkout/shipping"]')
    await waitForText('Shipping address')
    await waitForText('Discount Test')

    await clickText('Continue to payment')
    await waitForText('Payment')

    await waitForText(name)
    await waitForText('25% off sale')
    await waitForText('$75.00')
    await waitForText('$100.00')
    await waitForText('Pay $75.00')

    const paymentAmount = await page.waitForSelector('text/Pay $75.00')
    expect(paymentAmount).toBeTruthy()
  }, 45000)
})
