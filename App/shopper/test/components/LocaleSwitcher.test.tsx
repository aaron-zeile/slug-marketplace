import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      label: 'Locale',
      en: 'English',
      fr: 'Français',
    };
    return labels[key] ?? key;
  },
}));

import LocaleSwitcher from '@/components/locale/LocaleSwitcher';

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'locale=; max-age=0; path=/';
  });

  it('renders the locale select control', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows English and French as options', async () => {
    render(<LocaleSwitcher />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Français' })).toBeInTheDocument();
    });
  });

  it('sets the locale cookie when a new locale is selected', async () => {
    render(<LocaleSwitcher />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByRole('option', { name: 'Français' }));
    fireEvent.click(screen.getByRole('option', { name: 'Français' }));
    expect(document.cookie).toContain('locale=fr');
  });

  it('calls router.refresh after changing locale', async () => {
    render(<LocaleSwitcher />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByRole('option', { name: 'Français' }));
    fireEvent.click(screen.getByRole('option', { name: 'Français' }));
    expect(mockRefresh).toHaveBeenCalledOnce();
  });
});
