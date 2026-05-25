import { expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import SearchPage from '../../src/app/search/[searchText]/page'
import SearchList from '../../src/app/search/[searchText]/SearchList'

vi.mock('../../src/app/search/[searchText]/SearchList', () => ({
  default: vi.fn(() => <div>Search list</div>),
}))

it('Renders', async () => {
  const result = await SearchPage({
    params: Promise.resolve({ searchText: "test" }),
  });

  render(result);
})

it('passes parsed filters to the search list', async () => {
  const result = await SearchPage({
    params: Promise.resolve({ searchText: 'desk%20lamp' }),
    searchParams: Promise.resolve({
      category: 'books',
      maxPrice: '50',
      minPrice: '10',
      minStars: 'not-a-number',
      sortBy: 'priceAsc',
    }),
  });

  render(result);

  expect(SearchList).toHaveBeenLastCalledWith({
    filters: {
      category: 'books',
      maxPrice: 50,
      minPrice: 10,
      minStars: undefined,
      sortBy: 'priceAsc',
    },
    searchText: 'desk%20lamp',
  }, undefined);
})
