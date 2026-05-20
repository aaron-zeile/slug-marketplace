import {describe, test} from 'vitest'
import {
  clickFirstItemNameOnHome,
  openItemByName,
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
})
