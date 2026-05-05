import {beforeEach, describe, test, it, expect} from 'vitest'
import {browser, page, clickOnAria, waitForText, waitForAria, waitForAriaToDisapear, waitForTextToDisapear} from './setup'

describe('Authentication', () => {
  test('Intial view is home page', async () => {
    await waitForText('slugmarketplace')
  })



//   test('New tab does not require re-authentication', async () => {
//     await logInAsMolly()
//     const tab = await browser.newPage()
//     await tab.goto(await page.url())
//     await tab.waitForSelector('text/Posts')
//     await tab.close();
//   });
})