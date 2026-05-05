import { render, screen } from '@testing-library/react';
import { expect, it, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event'

import { routerSpy } from './mockRouter'
import ItemCard, { type CardItem } from '../src/app/buyer/components/ItemCard';

const item: CardItem = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Headphones',
  price: 59.99,
  imageurl: [
    'https://www.kroger.com/product/images/xlarge/front/0081006114507',
  ],
};

beforeEach(() => {
  render(<ItemCard item={item} />);
})

it('routes to the item page when the card is clicked', async () => {
  await userEvent.click(screen.getByLabelText('Item Card 11111111-1111-4111-8111-111111111111'));

  expect(routerSpy).toHaveBeenCalledWith('/items/11111111-1111-4111-8111-111111111111');
});

it('renders the item name', () => {
  screen.getByText('Headphones');
});

it('renders the price formatted', () => {
  screen.getByText('$59.99');
});

it('renders the image', () => {
  const image = screen.getByRole('img', { name: item.name });

  expect(image.getAttribute('src')).toBe(item.imageurl[0]);
});
