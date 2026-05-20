import {describe, test} from 'vitest'
import {
  clickOnAria,
  logInWithMockGoogle,
  openItemByName,
  waitForAria,
  waitForText,
} from './setup'

const itemName = 'Juice'

describe('Add to cart', () => {
  test('Shows confirmation after adding item', async () => {
    const authenticated = await logInWithMockGoogle()
    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
  })
})

describe('Cart page', () => {
  test('Lists item after adding to cart', async () => {
    const authenticated = await logInWithMockGoogle()
    await waitForText(`Hello ${authenticated.name}`)
    await openItemByName(itemName)
    await clickOnAria(`add ${itemName} to cart`)
    await waitForAria('Added to cart.')
    await clickOnAria('Open cart')
    await waitForText('Cart')
    await waitForText('1 item in your cart')
    await waitForAria(`Cart item ${itemName}`)
  })
})
