import { beforeEach, expect, it, vi } from 'vitest';

import {
  fetchViewedItemsAction,
  recordViewedItemAction,
} from '../../src/app/viewed/actions';
import {
  getViewedItemDetails,
  recordViewedItem,
} from '../../src/viewed/service';
import { check, getSessionToken } from '../../src/server/auth/service';

vi.mock('../../src/viewed/service', () => ({
  getViewedItemDetails: vi.fn(),
  recordViewedItem: vi.fn(),
}));

vi.mock('../../src/server/auth/service', () => ({
  check: vi.fn(),
  getSessionToken: vi.fn(),
}));

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'riley@example.com',
  name: 'Riley',
};

const viewedItem = {
  id: '22222222-2222-4222-8222-222222222222',
  member: user.id,
  item: {
    id: '33333333-3333-4333-8333-333333333333',
    seller: {
      id: '44444444-4444-4444-8444-444444444444',
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
    status: 'active',
  },
  viewedAt: new Date('2026-05-11T12:00:00.000Z'),
};

const viewedEntry = {
  id: viewedItem.id,
  member: user.id,
  item: viewedItem.item.id,
  viewedAt: viewedItem.viewedAt,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
  vi.mocked(check).mockResolvedValue(user);
  vi.mocked(getViewedItemDetails).mockResolvedValue([viewedItem]);
  vi.mocked(recordViewedItem).mockResolvedValue(viewedEntry);
});

it('fetches viewed items for the signed in user', async () => {
  const result = await fetchViewedItemsAction();

  expect(result).toEqual({ success: true, data: [viewedItem] });
});

it('returns an empty list when there is no signed in user', async () => {
  vi.mocked(getSessionToken).mockResolvedValue(undefined);

  const result = await fetchViewedItemsAction();

  expect(result).toEqual({ success: true, data: [] });
});

it('returns a failed result when fetching viewed items throws', async () => {
  vi.mocked(getViewedItemDetails).mockRejectedValue(new Error('Failed to fetch'));

  const result = await fetchViewedItemsAction();

  expect(result).toEqual({ success: false, error: 'Failed to fetch' });
});

it('records a viewed item for the signed in user', async () => {
  const result = await recordViewedItemAction(viewedItem.item.id);

  expect(result).toEqual({ success: true, data: viewedEntry });
});

it('does not record a viewed item when the user is not signed in', async () => {
  vi.mocked(check).mockResolvedValue(undefined);

  const result = await recordViewedItemAction(viewedItem.item.id);

  expect(result).toEqual({ success: false, error: 'Not signed in' });
});

it('returns a failed result when recording a viewed item throws', async () => {
  vi.mocked(recordViewedItem).mockRejectedValue(new Error('Viewed unavailable'));

  const result = await recordViewedItemAction(viewedItem.item.id);

  expect(result).toEqual({ success: false, error: 'Viewed unavailable' });
});
