import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as nextIntl from 'next-intl';

import WishlistItem from '../../src/app/wishlist/WishlistItem';
import { Item } from '../../src/item';
import { routerSpy } from '../mockRouter';
import { addCartItemAction } from '../../src/app/cart/actions';
import { removeWishlistItemAction } from '../../src/app/wishlist/actions';
import { dispatchCartUpdated } from '../../src/cart/events';
import { dispatchWishlistUpdated } from '../../src/wishlist/events';

vi.mock('../../src/app/cart/actions', () => ({
  addCartItemAction: vi.fn(),
}));

vi.mock('../../src/app/wishlist/actions', () => ({
  removeWishlistItemAction: vi.fn(),
}));

vi.mock('../../src/cart/events', () => ({
  dispatchCartUpdated: vi.fn(),
}));

vi.mock('../../src/wishlist/events', () => ({
  dispatchWishlistUpdated: vi.fn(),
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
  quantity: 1,
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
      quantity: 1,
    },
  });
  vi.mocked(removeWishlistItemAction).mockResolvedValue({
    success: true,
    data: true,
  });
});

function renderWishlistItem(onRemove = vi.fn()) {
  render(<WishlistItem item={item} onRemove={onRemove} />);
  return onRemove;
}

it('renders the item name', () => {
  renderWishlistItem();
  screen.getByText('GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card');
});

it('renders the price formatted', () => {
  renderWishlistItem();
  screen.getByText('$635.99');
});

it('renders the price with French number formatting when locale is fr', () => {
  vi.spyOn(nextIntl, 'useLocale').mockReturnValue('fr');
  renderWishlistItem();
  expect(screen.getByText(/635/)).toBeDefined();
});

it('routes to the item page when the image is clicked', async () => {
  renderWishlistItem();
  const [imageLink] = screen.getAllByLabelText(`Wishlist item ${item.name}`);

  await userEvent.click(imageLink);

  expect(routerSpy).toHaveBeenCalledWith(`/items/11111111-1111-1111-1111-111111111111`);
});

it('adds the item to cart when add to cart is clicked', async () => {
  renderWishlistItem();

  await userEvent.click(
    screen.getByRole('button', { name: `Add ${item.name} to cart` }),
  );

  expect(addCartItemAction).toHaveBeenCalledWith(item.id);
  expect(dispatchCartUpdated).toHaveBeenCalledTimes(1);
});

it('removes the item when remove is clicked', async () => {
  const onRemove = renderWishlistItem();

  await userEvent.click(
    screen.getByRole('button', {
      name: `Remove ${item.name} from wishlist`,
    }),
  );

  expect(removeWishlistItemAction).toHaveBeenCalledWith(item.id);
  expect(onRemove).toHaveBeenCalledWith(item.id);
  expect(dispatchWishlistUpdated).toHaveBeenCalledTimes(1);
});

it('does not remove the item when remove action fails', async () => {
  vi.mocked(removeWishlistItemAction).mockResolvedValue({
    success: false,
    error: 'Nope',
  });
  const onRemove = renderWishlistItem();

  await userEvent.click(
    screen.getByRole('button', {
      name: `Remove ${item.name} from wishlist`,
    }),
  );

  expect(onRemove).not.toHaveBeenCalled();
  expect(dispatchWishlistUpdated).not.toHaveBeenCalled();
});
