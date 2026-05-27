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
  Topbar: {
    hello: 'Hello {name}',
    guest: 'Guest',
    sellerDashboard: 'Seller Dashboard',
    logout: 'Logout',
    login: 'Login',
    navigation: 'Main navigation',
    openProfileMenu: 'Open account menu',
    profileMenu: 'Account menu',
    language: 'Language',
    shippingAddresses: 'Shipping addresses',
    home: 'Home',
    backToHome: 'Back to home',
    brand: 'SlugMarketplace',
  },
  Home: {
    heroAriaLabel: 'Welcome',
    heroBadge: 'SlugMarketplace',
    heroTitleLine1: 'Find your next',
    heroTitleLine2: 'favorite find',
    heroSubtitle:
      'Curated picks from trusted sellers — great gear, fair prices, shopping made simple.',
    heroChipCurated: 'Curated picks',
    heroChipPrices: 'Fair prices',
    heroChipEasy: 'Easy browsing',
    heroTitle: 'Find your next favorite find',
    spotlightTitle: "Today's spotlight",
    spotlightEmpty:
      'Our spotlight pick is loading soon. Explore featured items below.',
    categoriesTitle: 'Shop by category',
    categoriesSubtitle: 'Browse popular sections across the marketplace.',
    'category.electronics': 'Electronics',
    'category.clothing': 'Clothing',
    'category.accessories': 'Accessories',
    'category.home': 'Home',
    'category.tools': 'Tools',
    'category.food': 'Food',
    'category.beauty': 'Beauty',
    'category.travel': 'Travel',
    'category.health': 'Health',
    'category.outdoors': 'Outdoors',
    'category.fitness': 'Fitness',
    'category.vehicles': 'Vehicles',
    'category.pets': 'Pets',
    'category.decor': 'Decor',
    featuredItems: 'Featured items',
    featuredSubtitle: 'Scroll to discover more products hand-picked for you.',
    viewDetails: 'Tap to view details',
  },
  Search: {
    placeholder: 'Search SlugMarketplace',
    searchForm: 'Search products',
    searchInput: 'Search',
    submitSearch: 'Submit search',
    resultsFor: 'Search results for {query}',
    itemsFound: '{count} items found',
    noResults: 'No items match your search.',
    sold: 'Sold',
    filters: 'Filters',
    toggleFilters: 'Toggle filters',
    clearFilters: 'Clear',
    price: 'Price',
    priceRange: 'Price range',
    minPrice: 'Min',
    maxPrice: 'Max',
    rating: 'Rating',
    allRatings: 'All',
    fourPlusStars: '4+ stars',
    threePlusStars: '3+ stars',
    twoPlusStars: '2+ stars',
    onePlusStars: '1+ stars',
  },
  Cart: {
    tooltip: 'Cart',
    openCart: 'Open cart',
    openCartWithCount: 'Open cart, {count} items',
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
    checkout: 'Checkout',
    signInToCheckout: 'Sign in to checkout.',
    total: 'Total',
  },
  Address: {
    title: 'Shipping addresses',
    subtitle: 'Manage where your orders are delivered.',
    loading: 'Loading addresses...',
    loadError: 'Unable to load addresses.',
    saveError: 'Unable to save address.',
    line1Required: 'Address line 1 is required.',
    cityRequired: 'City is required.',
    stateRequired: 'State is required.',
    postalCodeRequired: 'Postal code is required.',
    deleteError: 'Unable to delete address.',
    defaultError: 'Unable to set default address.',
    label: 'Label',
    line1: 'Address line 1',
    line2: 'Address line 2',
    city: 'City',
    state: 'State / Province',
    postalCode: 'Postal code',
    country: 'Country (2-letter code)',
    setDefault: 'Use as default shipping address',
    add: 'Add address',
    update: 'Save changes',
    cancel: 'Cancel',
    addNew: 'Add new address',
    edit: 'Edit',
    delete: 'Delete',
    makeDefault: 'Set as default',
    defaultBadge: 'Default',
    untitled: 'Address',
  },
  Checkout: {
    shippingTitle: 'Shipping address',
    shippingSubtitle: 'Choose where your order should be delivered.',
    loading: 'Loading addresses...',
    loadError: 'Unable to load addresses.',
    selectRequired: 'Select or add a shipping address to continue.',
    untitledAddress: 'Address',
    addAddress: 'Add a new address',
    continueToPayment: 'Continue to payment',
    paymentTitle: 'Payment',
    paymentSubtitle: 'Review your order and complete checkout.',
    paymentLoading: 'Loading checkout...',
    paymentLoadError: 'Unable to load checkout.',
    paymentNotConfigured: 'Payment is not configured.',
    paymentStartError: 'Unable to start payment. Please try again later.',
    paymentDetails: 'Payment details',
    paymentDetailsHint: 'Enter your card information to place the order.',
    orderSummary: 'Order summary',
    quantityLine: 'Qty {count}',
    total: 'Total',
    itemsInOrder_one: '{count} item',
    itemsInOrder_other: '{count} items',
    shippingTo: 'Shipping to',
    backToShipping: 'Back to shipping',
    payAmount: 'Pay {amount}',
    processingPayment: 'Processing...',
    checkoutTimer: 'Complete purchase within {time}',
    checkoutTimerExpired: 'Checkout time expired',
    insufficientStock: 'One or more items are out of stock.',
    cartExpired: 'Cart expired',
  },
  LocaleSwitcher: {
    label: 'Locale',
    selectLocale: 'Select language',
    en: 'English',
    fr: 'Français',
  },
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
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
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
