import { cookies } from 'next/headers'

type Cookie = { value: string } | undefined
export type AuthCookieOptions = Partial<{
  expires: Date
  httpOnly: boolean
  path: string
  sameSite: 'lax' | 'strict' | 'none'
  secure: boolean
}>

export interface AuthCookieStore {
  delete(name: string): void
  get(name: string): Cookie
  set(name: string, value: string, options: AuthCookieOptions): void
}

let testCookieStore: (() => Promise<AuthCookieStore>) | undefined

export function setAuthCookieStoreForTest(
  cookieStore: (() => Promise<AuthCookieStore>) | undefined,
) {
  testCookieStore = cookieStore
}

export function getAuthCookieStore() {
  return testCookieStore?.() ?? cookies()
}
