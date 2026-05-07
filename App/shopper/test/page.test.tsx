import { afterAll, beforeEach, it } from 'vitest'
import { render } from '@testing-library/react'

import Page from '../src/app/page'
import { setLoginCookieStoreForTest } from '../src/app/buyer/login/cookies'

beforeEach(() => {
  setLoginCookieStoreForTest(async () => {
    return {
      delete: () => {},
      get: () => undefined,
      set: () => {},
    }
  })
})

afterAll(() => {
  setLoginCookieStoreForTest(undefined)
})

it('Renders', async () => {
  render(<Page />)
})
