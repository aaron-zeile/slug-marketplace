import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as nextIntl from 'next-intl';

import CartItem from '../../src/app/cart/CartItem';
import { Item } from '../../src/item';
import { routerSpy } from '../mockRouter';
import {
  addCartItemAction,
  removeCartItemAction,
} from '../../src/app/cart/actions';

vi.mock('../../src/app/cart/actions', () => ({
  addCartItemAction: vi.fn(),
  removeCartItemAction: vi.fn(),
}));

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
  vi.clearAllMocks();
  vi.mocked(addCartItemAction).mockResolvedValue({
    success: true,
    data: {
      id: '33333333-3333-4333-8333-333333333333',
      member: '44444444-4444-4444-8444-444444444444',
      item: item.id,
      quantity: 2,
    },
  });
  vi.mocked(removeCartItemAction).mockResolvedValue({
    success: true,
    data: true,
  });
});

function renderCartItem(quantity = 1, onQuantityChange = vi.fn()) {
  render(
    <CartItem
      item={item}
      onQuantityChange={onQuantityChange}
      quantity={quantity}
    />,
  );
  return onQuantityChange;
}

it('renders the item name', () => {
  renderCartItem();
  screen.getByText('GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card');
});

it('renders the description', () => {
  renderCartItem();
  screen.getByText('12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.');
});

it('renders the price formatted', () => {
  renderCartItem();
  screen.getByText('$635.99');
});

it('renders the price with French number formatting when locale is fr', () => {
  vi.spyOn(nextIntl, 'useLocale').mockReturnValue('fr');
  renderCartItem();
  expect(screen.getByText(/635/)).toBeDefined();
});

it('renders the image', () => {
  renderCartItem();
  const image = screen.getByRole('img', { name: item.name });

  expect(image.getAttribute('src')).toBe(item.images[0]);
});

it('renders the quantity controls', () => {
  renderCartItem();
  screen.getByLabelText(`Quantity for ${item.name}`);
});

it('routes to the item page when the image is clicked', async () => {
  renderCartItem();
  const [imageLink] = screen.getAllByLabelText(`Cart item ${item.name}`);

  await userEvent.click(imageLink);

  expect(routerSpy).toHaveBeenCalledWith(`/items/11111111-1111-1111-1111-111111111111`);
});

it('routes to the item page when the text is clicked', async () => {
  renderCartItem();
  const [, textLink] = screen.getAllByLabelText(`Cart item ${item.name}`);

  await userEvent.click(textLink);

  expect(routerSpy).toHaveBeenCalledWith(`/items/11111111-1111-1111-1111-111111111111`);
});

it('calls add action and increases quantity when increase is clicked', async () => {
  const onQuantityChange = renderCartItem(2);

  await userEvent.click(screen.getByLabelText(`Increase quantity for ${item.name}`));

  expect(onQuantityChange).toHaveBeenCalledWith(item.id, 3);
});

it('calls remove action and decreases quantity when decrease is clicked', async () => {
  const onQuantityChange = renderCartItem(2);

  await userEvent.click(screen.getByLabelText(`Decrease quantity for ${item.name}`));

  expect(onQuantityChange).toHaveBeenCalledWith(item.id, 1);
});

it('does not change quantity when increase action fails', async () => {
  vi.mocked(addCartItemAction).mockResolvedValue({
    success: false,
    error: 'Nope',
  });
  const onQuantityChange = renderCartItem(2);

  await userEvent.click(screen.getByLabelText(`Increase quantity for ${item.name}`));

  expect(onQuantityChange).not.toHaveBeenCalled();
});

it('does not change quantity when decrease action fails', async () => {
  vi.mocked(removeCartItemAction).mockResolvedValue({
    success: false,
    error: 'Nope',
  });
  const onQuantityChange = renderCartItem(2);

  await userEvent.click(screen.getByLabelText(`Decrease quantity for ${item.name}`));

  expect(onQuantityChange).not.toHaveBeenCalled();
});
