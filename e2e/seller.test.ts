import {test} from 'vitest'
import {clickOnAria, logInWithMockGoogle, page} from './setup'

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

async function createListing(name = 'Test Name') {
  await logInWithMockGoogle()
  await page.goto(sellerUrl, {waitUntil: 'networkidle2'})

  await page.waitForSelector('text/Create Listing')
  await page.click('text/Create Listing')

  await page.click('aria/Name')
  await page.type('aria/Name', name)
  await page.click('aria/Description')
  await page.type('aria/Description', 'Test Description')
  await page.click('aria/Price')
  await page.type('aria/Price', '10')
  await page.click('aria/Quantity')
  await page.type('aria/Quantity', '2')
  await page.click('aria/Image URLs')
  await page.type('aria/Image URLs', listingImageUrl)

  await page.click('form button[type="submit"]')
  await page.waitForSelector(`text/Created ${name}.`)
}

test('User can create item and see it', async () => {
  const name = `Test Name ${Date.now()}`

  await createListing(name)
  await page.click('text/View')
  await page.waitForSelector(`text/${name}`)
  await page.click(`text/${name}`)
  await page.waitForSelector(`::-p-aria(Name for ${name})`)
})

test('User can edit item and see the update', async () => {
  const name = `Test Name ${Date.now()}`
  const editedName = `Edited Name ${Date.now()}`

  await createListing(name)
  await page.click('text/View')
  await page.waitForSelector(`text/${name}`)
  await page.click(`text/${name}`)
  await page.waitForSelector(`::-p-aria(Name for ${name})`)

  await replaceText(`::-p-aria(Name for ${name})`, editedName)
  await replaceText(`::-p-aria(Description for ${name})`, 'Edited Description')
  await replaceText(`::-p-aria(Price for ${name})`, '15')
  await replaceText(
    `::-p-aria(Image URLs for ${name})`,
    listingImageUrl,
  )

  await clickOnAria(`Update ${name}`)
  await page.waitForSelector(`::-p-aria(Name for ${name})`, { hidden: true })
  await page.waitForSelector(`text/${editedName}`)
  await page.click(`text/${editedName}`)
  await page.waitForSelector(`::-p-aria(Name for ${editedName})`)
})
