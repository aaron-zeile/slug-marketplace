import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import Topbar from '../src/app/buyer/topbar/Topbar'

const cookieDelete = vi.hoisted(() => vi.fn())
const cookieGet = vi.hoisted(() => vi.fn())
const jwtDecrypt = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(async () => {
      return {
        delete: cookieDelete,
        get: cookieGet,
      }
    }),
  }
})

vi.mock('jose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jose')>()

  return {
    ...actual,
    jwtDecrypt,
  }
})

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-secret'
  window.sessionStorage.clear()
  cookieGet.mockReturnValue(undefined)
  jwtDecrypt.mockReset()
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

it('does not show login when logged in', async () => {
  window.sessionStorage.setItem('name', 'Molly')
  cookieGet.mockReturnValue({ value: 'session-token' })
  jwtDecrypt.mockResolvedValue({
    payload: {
      email: 'molly@example.com',
      id: 1,
      name: 'Molly',
    },
  })
  render(<Topbar />)

  await screen.findByText('Hello Molly')
  fireEvent.click(screen.getByLabelText('profile'))

  await waitFor(() => {
    expect(screen.queryByLabelText('login')).toBeNull()
  })
  expect(await screen.findByLabelText('logout')).toBeTruthy()
})

it('uses the session cookie when opening a new tab', async () => {
  cookieGet.mockReturnValue({ value: 'session-token' })
  jwtDecrypt.mockResolvedValue({
    payload: {
      email: 'molly@example.com',
      id: 1,
      name: 'Molly',
    },
  })
  render(<Topbar />)

  await screen.findByText('Hello Molly')
  fireEvent.click(screen.getByLabelText('profile'))

  expect(await screen.findByLabelText('logout')).toBeTruthy()
  expect(screen.queryByLabelText('login')).toBeNull()
})

it('ignores a session check result after unmount', async () => {
  let resolveSession: (value: unknown) => void = () => {}
  cookieGet.mockReturnValue({ value: 'session-token' })
  jwtDecrypt.mockReturnValue(
    new Promise((resolve) => {
      resolveSession = resolve
    }),
  )

  const { unmount } = render(<Topbar />)

  unmount()
  resolveSession({
    payload: {
      email: 'molly@example.com',
      id: 1,
      name: 'Molly',
    },
  })

  await waitFor(() => {
    expect(jwtDecrypt).toHaveBeenCalled()
  })
})

it('shows login after logging out', async () => {
  window.sessionStorage.setItem('name', 'Molly')
  cookieGet.mockReturnValue({ value: 'session-token' })
  jwtDecrypt.mockResolvedValue({
    payload: {
      email: 'molly@example.com',
      id: 1,
      name: 'Molly',
    },
  })
  render(<Topbar />)

  await screen.findByText('Hello Molly')
  fireEvent.click(screen.getByLabelText('profile'))

  fireEvent.click(screen.getByLabelText('logout'))

  await screen.findByText('Hello Guest')
  expect(cookieDelete).toHaveBeenCalledWith('session')
  fireEvent.click(screen.getByLabelText('profile'))
  expect(await screen.findByLabelText('login')).toBeTruthy()
  expect(screen.queryByLabelText('logout')).toBeNull()
})
