// common test stuff here
import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';

import { MockRouter } from './test/mockRouter';

// --------------------
// TextEncoder / Decoder fix (Node vs JSDOM compatibility)
// --------------------
class TestTextEncoder extends TextEncoder {
  encode(input?: string) {
    return new Uint8Array(super.encode(input));
  }
}

globalThis.TextEncoder = TestTextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

// --------------------
// Next.js mocks
// --------------------

vi.mock('server-only', () => ({}));

const intlMessages: Record<string, Record<string, string>> = {
  App: { title: 'SlugMarketplace' },
  Topbar: { hello: 'Hello {name}', guest: 'Guest', logout: 'Logout' },
  Home: { featuredItems: 'Featured Items' },
  Search: {
    placeholder: 'Search SlugMarketplace',
    resultsFor: 'Search results for {query}',
    itemsFound: '{count} items found',
    noResults: 'No items match your search.',
  },
  Cart: {
    tooltip: 'Cart',
    title: 'Cart',
    itemsInCart_one: '{count} item in your cart',
    itemsInCart_other: '{count} items in your cart',
    loading: 'Loading your cart...',
    loadError: 'Unable to load your cart.',
    empty: 'Your cart is empty.',
    itemAriaLabel: 'Cart item {name}',
    decreaseQuantityAria: 'Decrease quantity for {name}',
    increaseQuantityAria: 'Increase quantity for {name}',
    quantityAria: 'Quantity for {name}',
  },
  LocaleSwitcher: { label: 'Locale', en: 'English', fr: 'Français' },
};

function formatMessage(
  namespace: string | undefined,
  key: string,
  values?: Record<string, string | number>,
) {
  const template = (namespace ? intlMessages[namespace]?.[key] : undefined) ?? key;
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    template,
  );
}

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) =>
    formatMessage(namespace, key, values),
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => (key: string, values?: Record<string, string | number>) =>
    formatMessage(namespace, key, values),
  getMessages: async () => intlMessages,
}));

// navigation (you already had this)
vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn().mockImplementation(() => {
      return MockRouter;
    }),
  };
});

vi.mock('next/headers', () => {
  return {
    cookies: () => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(() => []),
    }),

    headers: () => ({
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(() => []),
    }),
  };
});

// --------------------
// lifecycle hooks
// --------------------
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
