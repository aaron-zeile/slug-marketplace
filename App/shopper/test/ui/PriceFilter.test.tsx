import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import PriceFilter, {
  DEFAULT_MAX_PRICE,
  MIN_PRICE,
  clampPrice,
  roundUpToPriceStep,
} from '../../src/app/search/[searchText]/PriceFilter';

it('renders the current price range and inputs', () => {
  render(
    <PriceFilter
      maxPrice={2500}
      priceRange={[10, 75]}
      onPriceRangeChange={vi.fn()}
      onPriceRangeCommit={vi.fn()}
    />,
  );

  expect(screen.getByText('$10')).toBeDefined();
  expect(screen.getByText('$75')).toBeDefined();
  expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(10);
  expect(screen.getByRole('spinbutton', { name: 'Max' })).toHaveValue(75);
});

it('updates the minimum price from the min input', () => {
  const onPriceRangeChange = vi.fn();

  render(
    <PriceFilter
      maxPrice={2500}
      priceRange={[0, 100]}
      onPriceRangeChange={onPriceRangeChange}
      onPriceRangeCommit={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByRole('spinbutton', { name: 'Min' }), {
    target: { value: '25' },
  });

  expect(onPriceRangeChange).toHaveBeenCalledWith([25, 100]);
});

it('updates the maximum price from the max input', () => {
  const onPriceRangeChange = vi.fn();

  render(
    <PriceFilter
      maxPrice={2500}
      priceRange={[25, 100]}
      onPriceRangeChange={onPriceRangeChange}
      onPriceRangeCommit={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByRole('spinbutton', { name: 'Max' }), {
    target: { value: '125' },
  });

  expect(onPriceRangeChange).toHaveBeenCalledWith([25, 125]);
});

it('commits the current range when price inputs blur', () => {
  const onPriceRangeCommit = vi.fn();

  render(
    <PriceFilter
      maxPrice={2500}
      priceRange={[25, 100]}
      onPriceRangeChange={vi.fn()}
      onPriceRangeCommit={onPriceRangeCommit}
    />,
  );

  fireEvent.blur(screen.getByRole('spinbutton', { name: 'Min' }));
  fireEvent.blur(screen.getByRole('spinbutton', { name: 'Max' }));

  expect(onPriceRangeCommit).toHaveBeenCalledTimes(2);
});

it('updates the price range when the slider changes', () => {
  const onPriceRangeChange = vi.fn();

  render(
    <PriceFilter
      maxPrice={2500}
      priceRange={[0, 2500]}
      onPriceRangeChange={onPriceRangeChange}
      onPriceRangeCommit={vi.fn()}
    />,
  );

  const sliders = screen.getAllByRole('slider', { name: 'Price range' });
  fireEvent.change(sliders[0], { target: { value: '20' } });
  fireEvent.change(sliders[1], { target: { value: '125' } });

  expect(onPriceRangeChange).toHaveBeenCalledWith([20, 2500]);
  expect(onPriceRangeChange).toHaveBeenCalledWith([0, 125]);
});

it('rounds prices up to the nearest price step', () => {
  expect(roundUpToPriceStep(2006)).toBe(2010);
  expect(roundUpToPriceStep(Number.NaN)).toBe(DEFAULT_MAX_PRICE);
});

it('clamps prices to the supported range', () => {
  expect(clampPrice(-10, MIN_PRICE, 100)).toBe(MIN_PRICE);
  expect(clampPrice(125, MIN_PRICE, 100)).toBe(100);
  expect(clampPrice(Number.NaN, 50, 100)).toBe(50);
});
