import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import SortbyFilter from '../../src/app/search/[searchText]/SortbyFilter';

it('defaults to no sort', () => {
  render(<SortbyFilter onSortChange={vi.fn()} />);

  expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent(
    'None',
  );
});

it('renders the selected sort value', () => {
  render(<SortbyFilter selectedSortBy="ratingDesc" onSortChange={vi.fn()} />);

  expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent(
    'Highest rating',
  );
});

it('falls back to none for an unknown sort value', () => {
  render(
    <SortbyFilter
      selectedSortBy={'unknown' as 'newest'}
      onSortChange={vi.fn()}
    />,
  );

  expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent(
    'None',
  );
});

it('updates the selected sort value', () => {
  const onSortChange = vi.fn();

  render(<SortbyFilter onSortChange={onSortChange} />);

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Sort by' }));
  fireEvent.click(screen.getByRole('option', { name: 'Highest price' }));

  expect(onSortChange).toHaveBeenCalledWith('priceDesc');
});

it('clears sorting when none is selected', () => {
  const onSortChange = vi.fn();

  render(<SortbyFilter selectedSortBy="priceAsc" onSortChange={onSortChange} />);

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Sort by' }));
  fireEvent.click(screen.getByRole('option', { name: 'None' }));

  expect(onSortChange).toHaveBeenCalledWith(undefined);
});
