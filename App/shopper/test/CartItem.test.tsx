import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';

import CartItem from '../src/app/cart/CartItem';
import { Item } from '../src/item';
import { routerSpy } from './mockRouter';

const item: Item = {
  id: '11111111-1111-1111-1111-111111111111',
  seller: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Avery Parks',
  },
  name: 'GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card',
  description:
    '12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.',
  images: [
    'https://m.media-amazon.com/images/I/71ii5ow8slL._AC_UY218_.jpg',
  ],
  price: 635.99,
  created_at: '2026-05-11T12:00:00.000Z',
};

beforeEach(() => {
  render(<CartItem item={item} />);
});

it('renders the item name', () => {
  screen.getByText('GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card');
});

it('renders the description', () => {
  screen.getByText('12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.');
});

it('renders the price formatted', () => {
  screen.getByText('$635.99');
});

it('renders the image', () => {
  const image = screen.getByRole('img', { name: item.name });

  expect(image.getAttribute('src')).toBe(item.images[0]);
});

it('renders the quantity controls', () => {
  screen.getByLabelText(`quantity GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card`);
});

it('routes to the item page when the image is clicked', async () => {
  const [imageLink] = screen.getAllByLabelText(`Cart Item GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card`);

  await userEvent.click(imageLink);

  expect(routerSpy).toHaveBeenCalledWith(`/items/11111111-1111-1111-1111-111111111111`);
});

it('routes to the item page when the text is clicked', async () => {
  const [, textLink] = screen.getAllByLabelText(`Cart Item GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card`);

  await userEvent.click(textLink);

  expect(routerSpy).toHaveBeenCalledWith(`/items/11111111-1111-1111-1111-111111111111`);
});
