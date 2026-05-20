import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, expect, it } from 'vitest';

import FrontPage from '../../src/app/FrontPage';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('FrontPage', () => {
  beforeAll(async () => {
    await seedItemsServiceItem({
      name: 'Headphones',
      description: 'Wireless headphones for the home page.',
      images: ['https://example.com/headphones.jpg'],
      price: 59.99,
    });
    await seedItemsServiceItem({
      name: 'Backpack',
      description: 'A sturdy backpack.',
      images: ['https://example.com/backpack.jpg'],
      price: 34.5,
    });
    await seedItemsServiceItem({
      name: 'Desk Lamp',
      description: 'A bright desk lamp.',
      images: ['https://example.com/lamp.jpg'],
      price: 18.25,
    });
    releaseFetchStubForServiceTests();
  });

  it('renders item card', async () => {
    render(<FrontPage />);

    await waitFor(() => {
      expect(screen.getByText('Headphones')).toBeDefined();
    });
  });

  it('renders carousel items', async () => {
    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Featured items');

      expect(within(carousel).getByText('Desk Lamp')).toBeDefined();
      expect(within(carousel).getAllByText('Backpack').length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });
});
