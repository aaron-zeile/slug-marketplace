import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, it, vi } from 'vitest'

const actions = vi.hoisted(() => {
  return {
    login: vi.fn(),
  }
})

vi.mock('../../src/app/buyer/login/actions', () => {
  return {
    login: actions.login,
  }
})

vi.mock('@react-oauth/google', () => {
  return {
    GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
    GoogleLogin: ({
      onSuccess,
    }: {
      onSuccess: (response: { credential: string }) => Promise<void>
    }) => (
      <button
        aria-label="mock-google-login"
        onClick={() => {
          void onSuccess({ credential: 'google-token' })
        }}
      >
        Sign in with Google
      </button>
    ),
  }
})

import GoogleLogin from '../../src/app/buyer/login/GoogleLogin'

it('does not update the name when login returns an error', async () => {
  const setName = vi.fn()
  actions.login.mockResolvedValue({
    error: 'Invalid Google token',
  })

  render(<GoogleLogin setName={setName} />)

  fireEvent.click(await screen.findByLabelText('mock-google-login'))

  expect(actions.login).toHaveBeenCalledWith({ credential: 'google-token' })
  expect(setName).not.toHaveBeenCalled()
  expect(window.sessionStorage.getItem('name')).toBeNull()
})
