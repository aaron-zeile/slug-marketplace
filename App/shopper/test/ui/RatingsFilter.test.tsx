import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import RatingsFilter from '../../src/app/search/[searchText]/RatingsFilter';

it('renders compact rating options', () => {
  render(<RatingsFilter selectedMinStars={4} onRatingChange={vi.fn()} />);

  expect(screen.getByRole('checkbox', { name: '4+ stars' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'All' })).not.toBeChecked();
});

it('selects a minimum star rating', () => {
  const onRatingChange = vi.fn();

  render(<RatingsFilter onRatingChange={onRatingChange} />);

  fireEvent.click(screen.getByRole('checkbox', { name: '3+ stars' }));

  expect(onRatingChange).toHaveBeenCalledWith(3);
});

it('clears the minimum star rating when all ratings is selected', () => {
  const onRatingChange = vi.fn();

  render(<RatingsFilter selectedMinStars={4} onRatingChange={onRatingChange} />);

  fireEvent.click(screen.getByRole('checkbox', { name: 'All' }));

  expect(onRatingChange).toHaveBeenCalledWith(undefined);
});
