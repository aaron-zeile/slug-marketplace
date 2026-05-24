import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '@/app/page';

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

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the email field, password field, and sign in button', () => {
    mockFetch({});
    render(<SignInPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('disables the submit button when both fields are empty', () => {
    mockFetch({});
    render(<SignInPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('disables the submit button when only email is filled', async () => {
    mockFetch({});
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('disables the submit button when only password is filled', async () => {
    mockFetch({});
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('enables the submit button when both fields are filled', async () => {
    mockFetch({});
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
  });

  it('redirects to /dashboard on successful login', async () => {
    mockFetch({ data: { login: { success: true } } });
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'correctpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows the error message returned by the server on failed login', async () => {
    mockFetch({ data: { login: { success: false, message: 'Invalid credentials' } } });
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument(),
    );
  });

  it('shows the GraphQL error message when the server returns errors', async () => {
    mockFetch({ errors: [{ message: 'Internal server error' }] });
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'anypass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText('Internal server error')).toBeInTheDocument(),
    );
  });

  it('shows a network error message when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'anypass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeInTheDocument(),
    );
  });

  it('does not redirect when login fails', async () => {
    mockFetch({ data: { login: { success: false, message: 'Invalid credentials' } } });
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => screen.getByText('Invalid credentials'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows a generic login failed message when success is false without a message', async () => {
    mockFetch({ data: { login: { success: false } } });
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'anypass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText('Login failed')).toBeInTheDocument(),
    );
  });
});
