import {describe, test} from 'vitest'
import {
  clickFirstItemNameOnHome,
  clickOnAria,
  openItemByName,
  page,
  waitForAria,
  waitForText,
} from './setup'

const itemName = 'Juice'
const itemPrice = '$3.56'

describe('Home', () => {
  test('Initial view greets guest', async () => {
    await waitForText('Hello Guest')
  })
})

describe('Browse items', () => {
  test('Clicking first item name opens listing', async () => {
    const name = await clickFirstItemNameOnHome()
    await waitForText(name)
  })
})

describe('Item listing', () => {
  test('Name', async () => {
    await openItemByName(itemName)
    await waitForText(itemName)
  })

  test('Price', async () => {
    await openItemByName(itemName)
    await waitForAria(itemPrice)
  })

  test('Add to cart button', async () => {
    await openItemByName(itemName)
    await waitForAria(`add ${itemName} to cart`)
  })
  
  describe('Search filters', () => {
    test('Juice cannot be seen with search when misspelled', async () => {
      await waitForText('Hello Guest')

      await clickOnAria('Search')
      await page.keyboard.type('juioce')
      await clickOnAria('Submit search')

      await waitForText('Search results for juioce')
      await waitForText('No items match your search.')
    })

    test('Juice can be seen with search', async () => {
      await waitForText('Hello Guest')

      await clickOnAria('Search')
      await page.keyboard.type('juice')
      await clickOnAria('Submit search')

      await waitForText('Search results for juice')

await waitForAria(`Search Item ${itemName}`)
    })
    test('Juice can be seen with correct ratings filter', async () => {
      await waitForText('Hello Guest')

      await clickOnAria('Search')
      await page.keyboard.type('juice')
      await clickOnAria('Submit search')

      await waitForText('Search results for juice')
      await clickOnAria('Filters')
      await clickOnAria('All')

await waitForAria(`Search Item ${itemName}`)
    })
    test('Juice cannot be seen with ratings filter', async () => {
      await waitForText('Hello Guest')

      await clickOnAria('Search')
      await page.keyboard.type('juice')
      await clickOnAria('Submit search')

      await waitForText('Search results for juice')
      await clickOnAria('Filters')
      await clickOnAria('4+ stars')

      await waitForText('No items match your search.')
    })

    test('Juice can be seen when minimum price is below item price', async () => {
      await page.goto('http://localhost:3000/search/juice?minPrice=3')

      await waitForText('Search results for juice')
      await waitForAria(`Search Item ${itemName}`)
    })

    test('Juice cannot be seen when minimum price is above item price', async () => {
      await page.goto('http://localhost:3000/search/juice?minPrice=4')

      await waitForText('Search results for juice')
      await waitForText('No items match your search.')
    })

    test('Juice can be seen when maximum price is above item price', async () => {
      await page.goto('http://localhost:3000/search/juice?maxPrice=4')

      await waitForText('Search results for juice')
      await waitForAria(`Search Item ${itemName}`)
    })

    test('Juice cannot be seen when maximum price is below item price', async () => {
      await page.goto('http://localhost:3000/search/juice?maxPrice=3')

      await waitForText('Search results for juice')
      await waitForText('No items match your search.')
    })
  })
})
