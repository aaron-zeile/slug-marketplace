import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';

import LinkCard, {
  type LinkCardItem,
} from '../../src/app/buyer/components/LinkCard';
import { routerSpy } from '../mockRouter';

const link: LinkCardItem = {
  id: 'electronics',
  category: 'Electronics',
  imageurl: 'https://example.com/electronics.webp',
  path: '/search?category=electronics',
};

beforeEach(() => {
  routerSpy.mockClear();
});

it('renders the category name', () => {
  render(<LinkCard link={link} />);

  screen.getByText('Electronics');
});

it('navigates to the category search page when clicked', async () => {
  render(<LinkCard link={link} />);

  await userEvent.click(screen.getByLabelText('Category Link Card Electronics'));

  expect(routerSpy).toHaveBeenCalledWith('/search?category=electronics');
});
