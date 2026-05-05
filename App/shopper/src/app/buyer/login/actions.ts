'use server'

import { cookies } from 'next/headers'

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
  try {
    return {
      authenticated: await new AuthService().login(credentials),
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Login failed',
    }
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
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
