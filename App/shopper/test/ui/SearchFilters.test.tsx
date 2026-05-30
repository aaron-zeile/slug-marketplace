import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { beforeEach, expect, it, vi } from 'vitest';

import SearchFilters from '../../src/app/search/[searchText]/SearchFilters';
import { MockRouter } from '../mockRouter';

const mockPathname = vi.mocked(usePathname);
const mockSearchParams = vi.mocked(useSearchParams);

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname.mockReturnValue('/search/desk');
  mockSearchParams.mockReturnValue(new URLSearchParams());
});

function openFilters() {
  fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));
}

it('renders the filter panel sections after opening the mobile menu', () => {
  render(
    <SearchFilters
      filters={{ maxPrice: 75, minPrice: 10, minStars: 4 }}
      maxItemPrice={2006}
    />,
  );
  openFilters();

  expect(screen.getByRole('heading', { name: 'Filters' })).toBeDefined();
  expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeDefined();
  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(10);
  expect(screen.getByRole('checkbox', { name: '4+ stars' })).toBeChecked();
});

it('orders incoming price filters when the minimum is above the maximum', () => {
  render(<SearchFilters filters={{ maxPrice: 50, minPrice: 100 }} />);
  openFilters();

  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(50);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(100);
});

it('keeps existing params when a minimum price is applied', () => {
  mockSearchParams.mockReturnValue(
    new URLSearchParams('category=books&sortBy=priceAsc'),
  );

  render(<SearchFilters maxItemPrice={2500} />);
  openFilters();

  const minInput = screen.getByRole('spinbutton', { name: 'Min' });
  fireEvent.change(minInput, { target: { value: '25' } });
  fireEvent.blur(minInput);

  expect(MockRouter.push).toHaveBeenCalledWith(
    '/search/desk?category=books&sortBy=priceAsc&minPrice=25',
  );
});

it('removes price params when the full price range is committed', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('minPrice=20&maxPrice=60'));

  render(
    <SearchFilters
      filters={{ maxPrice: 60, minPrice: 20 }}
      maxItemPrice={2500}
    />,
  );
  openFilters();

  const minInput = screen.getByRole('spinbutton', { name: 'Min' });
  const maxInput = screen.getByRole('spinbutton', { name: 'Max' });
  fireEvent.change(minInput, { target: { value: '0' } });
  fireEvent.change(maxInput, { target: { value: '2500' } });
  fireEvent.blur(maxInput);

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk');
});

it('does not add a maximum price param when the maximum is at the ceiling', () => {
  render(<SearchFilters maxItemPrice={2500} />);
  openFilters();

  fireEvent.blur(screen.getByRole('spinbutton', { name: 'Max' }));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk');
});

it('updates the maximum price filter from the max input', () => {
  render(<SearchFilters maxItemPrice={2500} />);
  openFilters();

  const maxInput = screen.getByRole('spinbutton', { name: 'Max' });
  fireEvent.change(maxInput, { target: { value: '125' } });
  fireEvent.blur(maxInput);

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk?maxPrice=125');
});

it('updates the minimum stars filter from the rating checkboxes', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('minPrice=20'));

  render(<SearchFilters />);
  openFilters();

  fireEvent.click(screen.getByRole('checkbox', { name: '3+ stars' }));

  expect(MockRouter.push).toHaveBeenCalledWith(
    '/search/desk?minPrice=20&minStars=3',
  );
});

it('removes the rating filter when all ratings is selected', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('minStars=4'));

  render(<SearchFilters filters={{ minStars: 4 }} />);
  openFilters();

  fireEvent.click(screen.getByRole('checkbox', { name: 'All' }));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk');
});

it('updates the sort filter from the sort menu', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('category=books'));

  render(<SearchFilters filters={{ category: 'books' }} />);
  openFilters();

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Sort by' }));
  fireEvent.click(screen.getByRole('option', { name: 'Highest price' }));

  expect(MockRouter.push).toHaveBeenCalledWith(
    '/search/desk?category=books&sortBy=priceDesc',
  );
});

it('toggles the mobile filters menu', () => {
  render(<SearchFilters />);

  const toggle = screen.getByRole('button', { name: 'Toggle filters' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

it('toggles the mobile filters menu from the filters label', () => {
  render(<SearchFilters />);

  const labelToggle = screen.getByRole('button', { name: 'Filters' });
  expect(labelToggle).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(labelToggle);

  expect(labelToggle).toHaveAttribute('aria-expanded', 'true');
});

it('clears price, rating, and sort params without removing unrelated params', () => {
  mockSearchParams.mockReturnValue(
    new URLSearchParams('category=books&minPrice=20&maxPrice=60&minStars=4&sortBy=priceDesc'),
  );

  render(
    <SearchFilters
      filters={{ category: 'books', maxPrice: 60, minPrice: 20, minStars: 4 }}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk?category=books');
});
