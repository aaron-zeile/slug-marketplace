import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

import LocaleSwitcher from '@/app/dashboard/localeSwitcher/localeSwitcher';

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the locale cookie before each test
    document.cookie = 'locale=; max-age=0; path=/';
  });

  it('renders the locale select control', () => {
    render(<LocaleSwitcher currentLocale="en" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows English and French as options', async () => {
    render(<LocaleSwitcher currentLocale="en" />);
    // Open the dropdown
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Français' })).toBeInTheDocument();
    });
  });

  it('sets the locale cookie when a new locale is selected', async () => {
    render(<LocaleSwitcher currentLocale="en" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByRole('option', { name: 'Français' }));
    fireEvent.click(screen.getByRole('option', { name: 'Français' }));
    expect(document.cookie).toContain('locale=fr');
  });

  it('calls router.refresh after changing locale', async () => {
    render(<LocaleSwitcher currentLocale="en" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByRole('option', { name: 'Français' }));
    fireEvent.click(screen.getByRole('option', { name: 'Français' }));
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('initialises with the provided currentLocale', () => {
    render(<LocaleSwitcher currentLocale="fr" />);
    // The selected value text should be visible
    expect(screen.getByText('Français')).toBeInTheDocument();
  });
});
