import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import LinkCarousel from '../../src/app/buyer/components/LinkCarousel';
import { type LinkCardItem } from '../../src/app/buyer/components/LinkCard';
import { routerSpy } from '../mockRouter';

const links: LinkCardItem[] = [
  {
    id: 'electronics',
    category: 'Electronics',
    imageurl: 'https://example.com/electronics.webp',
    path: '/search?category=electronics',
  },
  {
    id: 'travel',
    category: 'Travel',
    imageurl: 'https://example.com/travel.webp',
    path: '/search?category=travel',
  },
];

const scrollBy = vi.fn();

vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
  configurable: true,
  value: scrollBy,
});

beforeEach(() => {
  scrollBy.mockClear();
  routerSpy.mockClear();
});

it('renders title and subtitle', () => {
  render(
    <LinkCarousel
      carouselTitle="Shop by category"
      links={links}
      subtitle="Browse popular sections."
    />,
  );

  screen.getByText('Shop by category');
  screen.getByText('Browse popular sections.');
});

it('renders category cards', () => {
  render(<LinkCarousel carouselTitle="Shop by category" links={links} />);

  const carousel = screen.getByLabelText('Carousel Shop by category');

  expect(within(carousel).getByText('Electronics')).toBeDefined();
});

it('navigates when a category card is clicked', async () => {
  render(<LinkCarousel carouselTitle="Shop by category" links={links} />);

  await userEvent.click(screen.getByLabelText('Category Link Card Electronics'));

  expect(routerSpy).toHaveBeenCalledWith('/search?category=electronics');
});

it('scrolls left when left button is clicked', async () => {
  render(<LinkCarousel carouselTitle="Shop by category" links={links} />);

  await userEvent.click(screen.getByLabelText('Scroll Shop by category left'));

  expect(scrollBy).toHaveBeenCalledWith({
    left: -280,
    behavior: 'smooth',
  });
});

it('scrolls right when right button is clicked', async () => {
  render(<LinkCarousel carouselTitle="Shop by category" links={links} />);

  await userEvent.click(screen.getByLabelText('Scroll Shop by category right'));

  expect(scrollBy).toHaveBeenCalledWith({
    left: 280,
    behavior: 'smooth',
  });
});
