import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import Topbar from '../src/app/buyer/topbar/Topbar'

vi.mock('../src/app/buyer/login/actions', () => {
  return {
    login: vi.fn(),
    logout: vi.fn(async () => undefined),
  }
})

beforeEach(() => {
  window.sessionStorage.clear()
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
  render(<Topbar />)

  await screen.findByText('Hello Molly')
  fireEvent.click(screen.getByLabelText('profile'))

  await waitFor(() => {
    expect(screen.queryByLabelText('login')).toBeNull()
  })
  expect(await screen.findByLabelText('logout')).toBeTruthy()
})

it('shows login after logging out', async () => {
  window.sessionStorage.setItem('name', 'Molly')
  render(<Topbar />)

  await screen.findByText('Hello Molly')
  fireEvent.click(screen.getByLabelText('profile'))

  fireEvent.click(screen.getByLabelText('logout'))

  await screen.findByText('Hello Guest')
  fireEvent.click(screen.getByLabelText('profile'))
  expect(await screen.findByLabelText('login')).toBeTruthy()
  expect(screen.queryByLabelText('logout')).toBeNull()
})
