import { cookies } from 'next/headers'

type Cookie = { value: string } | undefined

export type LoginCookieOptions = Partial<{
  expires: Date
  httpOnly: boolean
  path: string
  sameSite: 'lax' | 'strict' | 'none'
  secure: boolean
}>

export interface LoginCookieStore {
  delete(name: string): void
  get(name: string): Cookie
  set(name: string, value: string, options: LoginCookieOptions): void
}

let testCookieStore: (() => Promise<LoginCookieStore>) | undefined

export function setLoginCookieStoreForTest(
  cookieStore: (() => Promise<LoginCookieStore>) | undefined,
) {
  testCookieStore = cookieStore
}

export function getLoginCookieStore() {
  return testCookieStore?.() ?? cookies()
}
