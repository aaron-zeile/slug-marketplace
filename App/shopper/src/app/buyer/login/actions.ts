'use server'

import { getAuthCookieStore } from '@/auth/cookies'
import { AuthService } from '@/auth/service'
import type { Authenticated, Credentials, SessionUser } from '@/auth'

export interface LoginResult {
  authenticated?: Authenticated
  error?: string
}

export interface CheckLoginResult {
  user?: SessionUser
}

export async function login(
  credentials: Credentials,
): Promise<LoginResult> {
    return {
      authenticated: await new AuthService().login(credentials),
    }
}

export async function checkLogin(): Promise<CheckLoginResult> {
  try {
    return {
      user: await new AuthService().check(),
    }
  } catch {
    return {}
  }
}

export async function logout() {
  const cookieStore = await getAuthCookieStore()
  cookieStore.delete('session')
}
