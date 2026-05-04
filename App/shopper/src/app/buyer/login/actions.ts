'use server'

import { cookies } from 'next/headers'

import { AuthService } from '@/auth/service'
import type { Authenticated, Credentials } from '@/auth'

export interface LoginResult {
  authenticated?: Authenticated
  error?: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const parts = [
      typeof record.name === 'string' ? record.name : undefined,
      typeof record.code === 'string' ? `code ${record.code}` : undefined,
      typeof record.detail === 'string' ? record.detail : undefined,
      typeof record.message === 'string' && record.message
        ? record.message
        : undefined,
    ].filter(Boolean)

    if (parts.length > 0) {
      return parts.join(': ')
    }

    return JSON.stringify(record)
  }

  return String(error || 'Login failed')
}

export async function login(
  credentials: Credentials,
): Promise<LoginResult> {
  try {
    return {
      authenticated: await new AuthService().login(credentials),
    }
  } catch (error) {
    console.error('Login failed:', error)
    return {
      error: getErrorMessage(error),
    }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
