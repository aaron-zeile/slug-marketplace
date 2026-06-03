import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import Topbar from '../../src/app/buyer/topbar/Topbar';

const session = vi.hoisted(() => ({
  setIsAuthenticated: vi.fn(),
  setName: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('../../src/app/buyer/topbar/useShopperSession', () => ({
  useShopperSession: () => ({
    name: null,
    setName: session.setName,
    isAuthenticated: false,
    setIsAuthenticated: session.setIsAuthenticated,
    clearSession: session.clearSession,
  }),
}));

vi.mock('../../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../../src/app/buyer/login/GoogleLogin', () => ({
  default: ({
    onAuthenticated,
    onLogin,
  }: {
    onAuthenticated: () => void;
    onLogin?: () => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        onAuthenticated();
        onLogin?.();
      }}
    >
      Mock sign in
    </button>
  ),
}));

beforeEach(() => {
  session.setIsAuthenticated.mockClear();
  session.setName.mockClear();
  session.clearSession.mockClear();
});

it('authenticates and closes the menu from Google login', async () => {
  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('Open account menu'));
  expect(screen.getByText('Language')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Mock sign in' }));

  expect(session.setIsAuthenticated).toHaveBeenCalledWith(true);
  expect(screen.getByLabelText('Open account menu')).not.toHaveAttribute(
    'aria-expanded',
    'true',
  );
});
