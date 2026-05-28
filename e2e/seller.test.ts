import {test} from 'vitest'
import {logInWithMockGoogle, page} from './setup'

const sellerUrl = process.env.E2E_SELLER_URL ?? 'http://localhost:3000/seller'
const listingImageUrl =
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&fit=crop'

async function replaceText(selector: string, value: string) {
  await page.click(selector)
  await page.keyboard.down('Control')
  await page.keyboard.press('A')
  await page.keyboard.up('Control')
  await page.type(selector, value)
}

async function createListing() {
  await logInWithMockGoogle()
  await page.goto(sellerUrl, {waitUntil: 'networkidle2'})

  await page.waitForSelector('text/Create Listing')
  await page.click('text/Create Listing')

  await page.click('aria/Name')
  await page.type('aria/Name', 'Test Name')
  await page.click('aria/Description')
  await page.type('aria/Description', 'Test Description')
  await page.click('aria/Price')
  await page.type('aria/Price', '10')
  await page.click('aria/Image URLs')
  await page.type('aria/Image URLs', listingImageUrl)

  await page.click('form button[type="submit"]')
  await page.waitForSelector('text/Created Test Name.')
}

test('User can create item and see it', async () => {
  await createListing()
  await page.click('text/View')
  await page.waitForSelector('text/Test Name')
  await page.click('text/Test Name')
  await page.waitForSelector('::-p-aria(Name for Test Name)')
})

test('User can edit item and see the update', async () => {
  await createListing()
  await page.click('text/View')
  await page.waitForSelector('text/Test Name')
  await page.click('text/Test Name')
  await page.waitForSelector('::-p-aria(Name for Test Name)')

  await replaceText('::-p-aria(Name for Test Name)', 'Edited Name')
  await replaceText('::-p-aria(Description for Test Name)', 'Edited Description')
  await replaceText('::-p-aria(Price for Test Name)', '15')
  await replaceText(
    '::-p-aria(Image URLs for Test Name)',
    listingImageUrl,
  )

  await page.waitForSelector('text/Update')
  await page.click('text/Update')
  await page.waitForSelector('text/Edited Name')
  await page.click('text/Edited Name')
  await page.waitForSelector('::-p-aria(Name for Edited Name)')
})
