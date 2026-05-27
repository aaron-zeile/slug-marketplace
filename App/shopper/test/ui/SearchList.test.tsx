import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import SearchList from '../../src/app/search/[searchText]/SearchList';
import { Item } from '../../src/item';
import {
  fetchFilteredItemsAction,
  fetchSearchItemsAction,
} from '../../src/app/search/[searchText]/actions';

vi.mock('../../src/app/search/[searchText]/actions', () => ({
  fetchFilteredItemsAction: vi.fn(),
  fetchSearchItemsAction: vi.fn(),
}));

const items: Item[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    seller: {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Avery Parks',
    },
    name: 'Desk Lamp',
    description: 'A bright lamp for late-night study sessions.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop'],
    price: 24.99,
    quantity: 1,
    created_at: '2026-05-11T12:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    seller: {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Riley Quinn',
    },
    name: 'Desk Lamp Bulb',
    description: 'A replacement bulb for compact desk lamps.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop'],
    price: 6.5,
    quantity: 1,
    created_at: '2026-05-12T12:00:00.000Z',
  },
];

const expensiveItems: Item[] = [
  {
    id: '55555555-5555-4555-8555-555555555555',
    seller: {
      id: '66666666-6666-4666-8666-666666666666',
      name: 'Jordan Lee',
    },
    name: 'High-end Workstation',
    description: 'A powerful desktop for demanding projects.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&fit=crop'],
    price: 2502,
    quantity: 1,
    created_at: '2026-05-13T12:00:00.000Z',
  },
];

const stubSearchResponse = (searchItems: Item[]) => {
  vi.mocked(fetchSearchItemsAction).mockResolvedValue({
    success: true,
    data: searchItems,
  });
};

const stubFilteredResponse = (filteredItems: Item[]) => {
  vi.mocked(fetchFilteredItemsAction).mockResolvedValue({
    success: true,
    data: filteredItems,
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  stubSearchResponse(items);
  stubFilteredResponse(items);
});

it('renders the decoded search text', async () => {
  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  screen.getByText('Search results for desk lamp');
});

it('fetches search items using the search text', async () => {
  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  expect(fetchSearchItemsAction).toHaveBeenCalledWith('desk lamp');
});

it('renders search item', async () => {
  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  screen.getByText('Desk Lamp');
});

it('renders the item count', async () => {
  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  screen.getByText('2 items found');
});

it('renders the search filters sidebar', async () => {
  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  screen.getByRole('heading', { name: 'Filters' });
  fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));
  expect(screen.getAllByRole('slider', { name: 'Price range' })).toHaveLength(2);
  screen.getByRole('checkbox', { name: '4+ stars' });
});

it('renders an empty state when no items match', async () => {
  stubSearchResponse([]);

  const result = await SearchList({ searchText: 'missing' });

  render(result);

  screen.getByText('No items match your search.');
});

it('renders an empty state when the search action fails', async () => {
  vi.mocked(fetchSearchItemsAction).mockResolvedValue({
    success: false,
    error: 'Search failed',
  });

  const result = await SearchList({ searchText: 'desk%20lamp' });

  render(result);

  screen.getByText('0 items found');
  screen.getByText('No items match your search.');
});

it('fetches active category results with filtered items', async () => {
  const result = await SearchList({
    filters: {
      category: 'books',
      maxPrice: 50,
      minPrice: 10,
      minStars: 4,
      sortBy: 'priceAsc',
    },
    searchText: 'desk%20lamp',
  });

  render(result);

  expect(fetchFilteredItemsAction).toHaveBeenNthCalledWith(1, {
    maxPrice: 50,
    minPrice: 10,
    minStars: 4,
    searchText: 'desk lamp',
    sortBy: 'priceAsc',
    status: 'active',
    tag: 'books',
  });
});

it('uses the unpriced matching result set for the max price filter ceiling', async () => {
  vi.mocked(fetchFilteredItemsAction)
    .mockResolvedValueOnce({
      success: true,
      data: [items[1]],
    })
    .mockResolvedValueOnce({
      success: true,
      data: expensiveItems,
    });

  const result = await SearchList({
    filters: {
      maxPrice: 50,
      minPrice: 5,
    },
    searchText: 'desk%20lamp',
  });

  render(result);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));

  expect(fetchFilteredItemsAction).toHaveBeenNthCalledWith(2, {
    searchText: 'desk lamp',
    status: 'active',
    tag: undefined,
  });
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(50);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveAttribute(
    'max',
    '2505',
  );
});

it('falls back to visible items when the price ceiling fetch fails', async () => {
  vi.mocked(fetchFilteredItemsAction)
    .mockResolvedValueOnce({
      success: true,
      data: expensiveItems,
    })
    .mockResolvedValueOnce({
      success: false,
      error: 'Price ceiling failed',
    });

  const result = await SearchList({
    filters: {
      category: 'electronics',
    },
  });

  render(result);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));

  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(2505);
});

it('uses the category as the title for category-only results', async () => {
  const result = await SearchList({ filters: { category: 'school%20books' } });

  render(result);

  screen.getByText('Search results for school books');
});

it('uses all items as the title when no search text or category is provided', async () => {
  const result = await SearchList({});

  render(result);

  screen.getByText('Search results for all items');
  expect(fetchFilteredItemsAction).toHaveBeenCalledWith({
    maxPrice: undefined,
    minPrice: undefined,
    minStars: undefined,
    searchText: undefined,
    sortBy: undefined,
    status: 'active',
    tag: undefined,
  });
});
