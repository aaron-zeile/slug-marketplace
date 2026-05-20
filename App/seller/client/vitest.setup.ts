import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const intlMessages: Record<string, Record<string, string>> = {
  App: { title: 'Dashboard' },
  Tabs: {
    listings: 'Listings',
    sales: 'Sales',
    feedback: 'Feedback',
    createListing: 'Create Listing',
    ariaLabel: 'Seller dashboard tabs',
  },
  Listings: {
    status: 'Status',
    image: 'Image',
    name: 'Name',
    description: 'Description',
    price: 'Price',
    images: 'Image URLs',
    nameInput: 'Name for {name}',
    descriptionInput: 'Description for {name}',
    priceInput: 'Price for {name}',
    imagesInput: 'Image URLs for {name}',
    update: 'Update',
    updating: 'Updating...',
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
    imagesLabel: 'Image URLs',
    imagesHelper: 'Enter one image URL per line.',
    submit: 'Create Listing',
    submitting: 'Creating...',
  },
  Error: { closeAria: 'Close error message' },
  LocaleSwitcher: { label: 'Locale', en: 'English', fr: 'Français' },
  Placeholders: {
    sales: 'Sales — coming soon',
    feedback: 'Feedback — coming soon',
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
