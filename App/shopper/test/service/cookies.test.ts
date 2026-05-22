import { afterEach, expect, it, vi } from 'vitest'

const cookieStore = vi.hoisted(() => {
  return {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  }
})

const nextHeaders = vi.hoisted(() => {
  return {
    cookies: vi.fn(async () => cookieStore),
  }
})

vi.mock('next/headers', () => {
  return nextHeaders
})

import {
  getLoginCookieStore,
  setLoginCookieStoreForTest,
} from '../../src/app/buyer/login/cookies'

afterEach(() => {
  setLoginCookieStoreForTest(undefined)
})

it('uses the injected cookie store in tests', async () => {
  const injectedStore = {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  }

  setLoginCookieStoreForTest(async () => injectedStore)

  await expect(getLoginCookieStore()).resolves.toBe(injectedStore)
  expect(nextHeaders.cookies).not.toHaveBeenCalled()
})

it('falls back to Next cookies when no test store is set', async () => {
  setLoginCookieStoreForTest(undefined)

  await expect(getLoginCookieStore()).resolves.toBe(cookieStore)
  expect(nextHeaders.cookies).toHaveBeenCalledOnce()
})
