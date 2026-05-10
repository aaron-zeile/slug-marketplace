import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from '@/app/dashboard/LogoutButton';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function mockFetch(payload: object) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(payload),
  });
}

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a logout button', () => {
    mockFetch({});
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls the logout mutation and redirects to / on click', async () => {
    mockFetch({ data: { logout: { success: true } } });
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/admin/api/graphql',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('logout'),
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state while logging out', async () => {
    // Never resolves so the button stays in loading state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(screen.getByRole('button', { name: /logging out/i })).toBeDisabled();
  });

  it('disables the button while the request is in flight', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
