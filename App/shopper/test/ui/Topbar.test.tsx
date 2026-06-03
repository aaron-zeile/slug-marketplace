import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, expect, it, vi } from 'vitest';

import { checkLogin, logout } from '../../src/app/buyer/login/actions';
import Topbar from '../../src/app/buyer/topbar/Topbar';

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
  vi.mocked(checkLogin).mockResolvedValue({});
  vi.mocked(logout).mockResolvedValue(undefined);
  vi.mocked(usePathname).mockReturnValue('/');
  window.sessionStorage.clear();
});

it('shows the back-to-home control away from the home page', async () => {
  vi.mocked(usePathname).mockReturnValue('/search');

  render(<Topbar />);

  expect(await screen.findByLabelText('Back to home')).toBeInTheDocument();
});

it('keeps the profile menu open when interacting with the language section', async () => {
  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('Open account menu'));

  const languageHeading = await screen.findByText('Language');
  const languageBox = languageHeading.parentElement;

  expect(languageBox).toBeTruthy();

  fireEvent.mouseDown(languageBox!);
  fireEvent.click(languageBox!);
  fireEvent.keyDown(languageBox!, { key: 'Enter' });

  expect(screen.getByText('Language')).toBeInTheDocument();
  expect(screen.getByLabelText('Select language')).toBeInTheDocument();
});

it('shows the account icon for guests without a display name', async () => {
  render(<Topbar />);

  await screen.findByText('Hello Guest');

  expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
});

it('shows the authenticated profile menu with the user name', async () => {
  vi.mocked(checkLogin).mockResolvedValue({
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'riley@example.com',
      name: 'Riley',
    },
  });

  render(<Topbar />);

  await screen.findByText('Hello Riley');
  fireEvent.click(screen.getByLabelText('Open account menu'));

  expect(screen.getByText('Riley')).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Shipping addresses' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Mock sign in' })).not.toBeInTheDocument();
});

it('logs out and returns to the guest greeting', async () => {
  vi.mocked(checkLogin).mockResolvedValue({
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'riley@example.com',
      name: 'Riley',
    },
  });

  render(<Topbar />);

  await screen.findByText('Hello Riley');
  fireEvent.click(screen.getByLabelText('Open account menu'));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Logout' }));

  await waitFor(() => {
    expect(logout).toHaveBeenCalled();
    expect(screen.getByText('Hello Guest')).toBeInTheDocument();
  });
});
