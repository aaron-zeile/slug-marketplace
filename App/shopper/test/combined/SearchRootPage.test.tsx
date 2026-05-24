import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import SearchRootPage from '../../src/app/search/page';
import SearchList from '../../src/app/search/[searchText]/SearchList';

vi.mock('../../src/app/search/[searchText]/SearchList', () => ({
  default: vi.fn(() => <div>Search list</div>),
}));

it('passes parsed filters to the root search list', async () => {
  const result = await SearchRootPage({
    searchParams: Promise.resolve({
      category: 'books',
      maxPrice: '75',
      minPrice: 'not-a-number',
      minStars: '4',
      sortBy: 'ratingDesc',
    }),
  });

  render(result);

  expect(SearchList).toHaveBeenLastCalledWith({
    filters: {
      category: 'books',
      maxPrice: 75,
      minPrice: undefined,
      minStars: 4,
      sortBy: 'ratingDesc',
    },
  }, undefined);
});

it('renders without query params', async () => {
  const result = await SearchRootPage({});

  render(result);

  expect(SearchList).toHaveBeenLastCalledWith({
    filters: {
      category: undefined,
      maxPrice: undefined,
      minPrice: undefined,
      minStars: undefined,
      sortBy: undefined,
    },
  }, undefined);
});
