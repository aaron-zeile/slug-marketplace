import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

const intlMessages: Record<string, Record<string, string>> = {
  App: { title: 'Dashboard' },
  Tabs: {
    listings: 'Listings',
    sales: 'Sales',
    analytics: 'Analytics',
    discounts: 'Discounts',
    createListing: 'Create Listing',
    contactAdmin: 'Contact Admin',
    apiKeys: 'API Keys',
    ariaLabel: 'Seller dashboard tabs',
  },
  ApiKeys: {
    title: 'API Keys',
    empty: 'No API keys yet',
  },
  Sales: {
    gridNoRows: 'No orders yet',
    gridLoadError: 'Orders failed to load',
  },
  Listings: {
    status: 'Status',
    image: 'Image',
    name: 'Name',
    description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    images: 'Image URLs',
    nameInput: 'Name for {name}',
    descriptionInput: 'Description for {name}',
    priceInput: 'Price for {name}',
    quantityInput: 'Quantity for {name}',
    quantityError: 'Quantity must be a whole number of at least 1.',
    imagesInput: 'Image URLs for {name}',
    editTitle: 'Edit {name}',
    editFallbackTitle: 'Edit listing',
    createdAt: 'Created {date}',
    cancel: 'Cancel',
    update: 'Update',
    updating: 'Updating...',
    delete: 'Delete',
    deleting: 'Deleting...',
    priceError: 'Price must be at least $0.01.',
    updateAria: 'Update {name}',
    deleteTooltip: 'Delete listing',
    deleteAria: 'Delete {name}',
    gridLoadError: 'Listings failed to load',
    gridNoRows: 'No active listings',
  },
  CreateListing: {
    title: 'Create Listing',
    createdSuccess: 'Created {name}.',
    viewListings: 'View',
    nameLabel: 'Name',
    descriptionLabel: 'Description',
    priceLabel: 'Price',
    priceError: 'Price must be at least $0.01.',
    quantityLabel: 'Quantity',
    quantityError: 'Quantity must be a whole number of at least 1.',
    imagesLabel: 'Image URLs',
    imagesHelper: 'Enter one image URL per line.',
    submit: 'Create Listing',
    submitting: 'Creating...',
  },
  Error: { closeAria: 'Close error message' },
  LocaleSwitcher: { label: 'Locale', en: 'English', fr: 'Français' },
  Placeholders: {
    sales: 'Sales — coming soon',
    analytics: 'Analytics — coming soon',
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
