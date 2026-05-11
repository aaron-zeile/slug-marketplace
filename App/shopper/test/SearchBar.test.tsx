import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, beforeEach } from 'vitest';

import SearchBar from '../src/app/buyer/components/SearchBar';
import { MockRouter } from './mockRouter';

beforeEach(() => {
  render(<SearchBar />);
});

it('routes to the search page for the entered text', async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('search'), 'desk lamp');
  fireEvent.submit(screen.getByLabelText('search form'));

  expect(MockRouter.push).toHaveBeenCalledWith('/search/desk%20lamp');
});

it('does nothing with whitespace or blank searches', async () => {
  fireEvent.submit(screen.getByLabelText('search form'));

  expect(MockRouter.push).not.toHaveBeenCalled();
});

it('does nothing with whitespace', async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('search'), '    ');
  fireEvent.submit(screen.getByLabelText('search form'));

  expect(MockRouter.push).not.toHaveBeenCalled();
});
