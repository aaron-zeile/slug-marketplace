import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { login } from '../src/app/buyer/login/actions'
import { setLoginCookieStoreForTest } from '../src/app/buyer/login/cookies'
import GoogleLogin from '../src/app/buyer/login/GoogleLogin'
import Topbar from '../src/app/buyer/topbar/Topbar'

const googleButtonLabel = 'mock-google-login'
const cookies: Record<string, string> = {}
const deletedCookies: string[] = []
const serviceUser = {
  id: 1,
  email: 'username@example.com',
  name: 'username',
  token: 'service-token',
}

const google = vi.hoisted(() => {
  return {
    lastLogin: undefined as Promise<void> | undefined,
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
        aria-label={googleButtonLabel}
        onClick={() => {
          google.lastLogin = onSuccess({ credential: 'google-token' }).catch(
            () => {},
          )
        }}
      >
        Sign in with Google
      </button>
    ),
  }
})

const fetchMock = vi.fn<typeof fetch>()

beforeAll(() => {
  vi.stubGlobal('fetch', fetchMock)
})

beforeEach(async () => {
  google.lastLogin = undefined
  fetchMock.mockReset()
  fetchMock.mockImplementation(async (input) => {
    const url = input.toString()

    if (url.endsWith('/login/check')) {
      return Response.json({
        id: serviceUser.id,
        email: serviceUser.email,
        name: serviceUser.name,
      })
    }

    return Response.json(serviceUser)
  })
  window.sessionStorage.clear()
  deletedCookies.length = 0

  for (const name of Object.keys(cookies)) {
    delete cookies[name]
  }

  setLoginCookieStoreForTest(async () => {
    return {
      delete: (name: string) => {
        deletedCookies.push(name)
        delete cookies[name]
      },
      get: (name: string) => {
        const value = cookies[name]

        return value ? { value } : undefined
      },
      set: (name: string, value: string) => {
        cookies[name] = value
      },
    }
  })
})

afterAll(async () => {
  setLoginCookieStoreForTest(undefined)
  vi.unstubAllGlobals()
})

it('Renders Page', async () => {
  render(<Topbar />)

  await screen.findByText('slugmarketplace')
})

it('shows login when logged out', async () => {
  render(<Topbar />)

  fireEvent.click(screen.getByLabelText('profile'))

  expect(await screen.findByLabelText('login')).toBeTruthy()
  expect(screen.queryByLabelText('logout')).toBeNull()
})

it('updates the greeting after Google login succeeds', async () => {
  render(<Topbar />)

  fireEvent.click(screen.getByLabelText('profile'))
  fireEvent.click(await screen.findByLabelText(googleButtonLabel))

  expect(await screen.findByText('Hello username')).toBeTruthy()
  expect(window.sessionStorage.getItem('name')).toBe('username')
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/login'),
    expect.objectContaining({
      body: JSON.stringify({ credential: 'google-token' }),
      method: 'POST',
    }),
  )
})

it('stays logged out when Google login fails', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ message: 'Invalid Google token' }, { status: 401 }),
  )

  render(<Topbar />)

  fireEvent.click(screen.getByLabelText('profile'))
  fireEvent.click(await screen.findByLabelText(googleButtonLabel))

  await google.lastLogin
  expect(await screen.findByText('Hello Guest')).toBeTruthy()
  expect(window.sessionStorage.getItem('name')).toBeNull()
  expect(screen.queryByLabelText('logout')).toBeNull()
})

it('logs in without a menu close callback', async () => {
  const setName = vi.fn()

  render(<GoogleLogin setName={setName} />)

  fireEvent.click(await screen.findByLabelText(googleButtonLabel))
  await google.lastLogin

  expect(setName).toHaveBeenCalledWith('username')
  expect(window.sessionStorage.getItem('name')).toBe('username')
})

it('does not show login when logged in', async () => {
  window.sessionStorage.setItem('name', 'username')
  await login({ credential: 'google-token' })

  render(<Topbar />)

  await screen.findByText('Hello username')
  fireEvent.click(screen.getByLabelText('profile'))

  await waitFor(() => {
    expect(screen.queryByLabelText('login')).toBeNull()
  })
  expect(await screen.findByLabelText('logout')).toBeTruthy()
})

it('uses the session cookie when opening a new tab', async () => {
  await login({ credential: 'google-token' })

  render(<Topbar />)

  await screen.findByText('Hello username')
  fireEvent.click(screen.getByLabelText('profile'))

  expect(await screen.findByLabelText('logout')).toBeTruthy()
  expect(screen.queryByLabelText('login')).toBeNull()
})

it('ignores a session check result after unmount', async () => {
  await login({ credential: 'google-token' })

  let resolveCookieStore: () => void = () => {}
  setLoginCookieStoreForTest(
    () =>
      new Promise((resolve) => {
        resolveCookieStore = () => {
          resolve({
            delete: (name: string) => {
              deletedCookies.push(name)
              delete cookies[name]
            },
            get: (name: string) => {
              const value = cookies[name]

              return value ? { value } : undefined
            },
            set: (name: string, value: string) => {
              cookies[name] = value
            },
          })
        }
      }),
  )

  const { unmount } = render(<Topbar />)

  unmount()
  resolveCookieStore()

  await waitFor(() => {
    expect(screen.queryByText('Hello username')).toBeNull()
  })
})

it('shows login after logging out', async () => {
  window.sessionStorage.setItem('name', 'username')
  await login({ credential: 'google-token' })

  render(<Topbar />)

  await screen.findByText('Hello username')
  fireEvent.click(screen.getByLabelText('profile'))

  fireEvent.click(screen.getByLabelText('logout'))

  await screen.findByText('Hello Guest')
  expect(deletedCookies).toEqual(['session'])
  fireEvent.click(screen.getByLabelText('profile'))
  expect(await screen.findByLabelText('login')).toBeTruthy()
  expect(screen.queryByLabelText('logout')).toBeNull()
})
