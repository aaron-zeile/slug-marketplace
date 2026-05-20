import {test} from 'vitest'
import {logInWithMockGoogle, page} from './setup'

async function replaceText(selector: string, value: string) {
  await page.click(selector)
  await page.keyboard.down('Control')
  await page.keyboard.press('A')
  await page.keyboard.up('Control')
  await page.type(selector, value)
}

async function createListing() {
  await logInWithMockGoogle()
  await page.goto('http://localhost:3000/seller', {waitUntil: 'networkidle2'})

  await page.click('text/Create Listing')

  await page.click('aria/Name')
  await page.type('aria/Name', 'Test Name')
  await page.click('aria/Description')
  await page.type('aria/Description', 'Test Description')
  await page.click('aria/Price')
  await page.type('aria/Price', '10')
  await page.click('aria/Image URLs')
  await page.type('aria/Image URLs', 'https://example.com/image.jpg')

  await page.click('form button[type="submit"]')
  await page.waitForSelector('text/Created Test Name.')
}

test('User can create item and see it', async () => {
  await createListing()
  await page.click('text/View')
  await page.waitForSelector('::-p-aria(Name for Test Name)')
})

test('User can edit item and see the update', async () => {
  await createListing()
  await page.click('text/View')
  await page.waitForSelector('::-p-aria(Name for Test Name)')

  await replaceText('::-p-aria(Name for Test Name)', 'Edited Name')
  await replaceText('::-p-aria(Description for Test Name)', 'Edited Description')
  await replaceText('::-p-aria(Price for Test Name)', '15')
  await replaceText(
    '::-p-aria(Image URLs for Test Name)',
    'https://example.com/edited-image.jpg',
  )

  await page.click('::-p-aria(Update Test Name)')
  await page.waitForSelector('::-p-aria(Name for Edited Name)')
})
