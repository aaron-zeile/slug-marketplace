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

it('renders price controls and compact rating options', () => {
  render(
    <SearchFilters
      filters={{ maxPrice: 75, minPrice: 10, minStars: 4 }}
      maxItemPrice={2006}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Filters' })).toBeDefined();
  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(10);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(75);
  expect(screen.getByRole('checkbox', { name: '4+ stars' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'All' })).not.toBeChecked();
});

it('rounds the slider ceiling up to the nearest five dollars', () => {
  render(<SearchFilters maxItemPrice={2006} />);

  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(2010);
});

it('falls back when incoming price filters are not finite numbers', () => {
  render(
    <SearchFilters
      filters={{ maxPrice: Number.NaN, minPrice: Number.NaN }}
      maxItemPrice={100}
    />,
  );

  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(0);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(2000);
});

it('orders incoming price filters when the minimum is above the maximum', () => {
  render(<SearchFilters filters={{ maxPrice: 50, minPrice: 100 }} />);

  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(50);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(100);
});

it('keeps existing params when a minimum price is applied', () => {
  mockSearchParams.mockReturnValue(
    new URLSearchParams('category=books&sortBy=priceAsc'),
  );

  render(<SearchFilters maxItemPrice={2500} />);

  const minInput = screen.getByRole('spinbutton', { name: 'Min' });
  fireEvent.change(minInput, { target: { value: '25' } });
  fireEvent.blur(minInput);

  expect(MockRouter.push).toHaveBeenCalledWith(
    '/search/desk?category=books&sortBy=priceAsc&minPrice=25',
  );
});

it('updates the maximum price filter from the max input', () => {
  render(<SearchFilters maxItemPrice={2500} />);

  const maxInput = screen.getByRole('spinbutton', { name: 'Max' });
  fireEvent.change(maxInput, { target: { value: '125' } });
  fireEvent.blur(maxInput);

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk?maxPrice=125');
});

it('updates the price range when the slider changes', () => {
  render(<SearchFilters maxItemPrice={2500} />);

  const sliders = screen.getAllByRole('slider', { name: 'Price range' });
  fireEvent.change(sliders[0], { target: { value: '20' } });
  fireEvent.change(sliders[1], { target: { value: '125' } });

  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(20);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(125);
});

it('updates the minimum stars filter from the rating checkboxes', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('minPrice=20'));

  render(<SearchFilters />);

  fireEvent.click(screen.getByRole('checkbox', { name: '3+ stars' }));

  expect(MockRouter.push).toHaveBeenCalledWith(
    '/search/desk?minPrice=20&minStars=3',
  );
});

it('removes the rating filter when all ratings is selected', () => {
  mockSearchParams.mockReturnValue(new URLSearchParams('minStars=4'));

  render(<SearchFilters filters={{ minStars: 4 }} />);

  fireEvent.click(screen.getByRole('checkbox', { name: 'All' }));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk');
});

it('clears price and rating params without removing unrelated params', () => {
  mockSearchParams.mockReturnValue(
    new URLSearchParams('category=books&minPrice=20&maxPrice=60&minStars=4'),
  );

  render(
    <SearchFilters
      filters={{ category: 'books', maxPrice: 60, minPrice: 20, minStars: 4 }}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk?category=books');
});
