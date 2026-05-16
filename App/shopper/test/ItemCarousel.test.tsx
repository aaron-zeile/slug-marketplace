import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import ItemCarousel from '../src/app/buyer/components/ItemCarousel';
import { type CardItem } from '../src/app/buyer/components/ItemCard';

const items: CardItem[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Headphones',
    price: 59.99,
    imageurl: [
      'https://www.kroger.com/product/images/xlarge/front/0081006114507',
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Backpack',
    price: 34.5,
    imageurl: [
      'https://paktbags.com/cdn/shop/files/PDP_35L_Backpack-PAKT-6-14-23-25138_524dfb70-e013-4e6c-85aa-53080a4b1cab.jpg?v=1726097709',
    ],
  },
];

beforeEach(() => {
  render(<ItemCarousel items={items} carouselTitle="Featured Items" />);
});

it('renders title', () => {
  screen.getByText('Featured Items');
});

it('renders a card', () => {
  screen.getByText('Headphones');
  screen.getByText('$59.99');
});

const scrollBy = vi.fn();

vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
  configurable: true,
  value: scrollBy,
});

it('scrolls left when left button is clicked', async () => {
  await userEvent.click(screen.getByLabelText('Scroll Featured Items left'));
  expect(scrollBy).toHaveBeenCalledWith({
    left: -280,
    behavior: 'smooth',
  });
});

it('scrolls right when right button is clicked', async () => {
  await userEvent.click(screen.getByLabelText('Scroll Featured Items right'));
  expect(scrollBy).toHaveBeenCalledWith({
    left: 280,
    behavior: 'smooth',
  });
});
