import { beforeAll, describe, expect, it, vi } from 'vitest';

import {
  createItemReviewAction,
  deleteItemReviewAction,
  fetchItemReviewSessionAction,
} from '../../src/app/items/[id]/actions';
import { getSessionToken } from '../../src/server/auth/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
  testUser,
} from '../support/itemsService';

vi.mock('../../src/server/auth/service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/server/auth/service')>();
  return {
    ...actual,
    getSessionToken: vi.fn(),
  };
});

registerItemsServiceHooks();

describe('review actions', () => {
  let itemId: string;

  beforeAll(async () => {
    vi.mocked(getSessionToken).mockResolvedValue('test-session-token');
    const item = await seedItemsServiceItem({
      name: 'Review Action Item',
      description: 'For action-layer review tests.',
      images: [],
      price: 11,
    });
    itemId = item.id;
    releaseFetchStubForServiceTests();
  });

  it('fetchItemReviewSessionAction reports logged out without a session', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await fetchItemReviewSessionAction();

    expect(result.loggedIn).toBe(false);
  });

  it('fetchItemReviewSessionAction reports logged out when session lookup fails', async () => {
    vi.mocked(getSessionToken).mockRejectedValueOnce(new Error('cookie failure'));

    const result = await fetchItemReviewSessionAction();

    expect(result.loggedIn).toBe(false);
  });

  it('createItemReviewAction returns an error when not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await createItemReviewAction(itemId, 5, 'No session');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/signed in/i);
  });

  it('deleteItemReviewAction returns an error when not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await deleteItemReviewAction(
      '00000000-0000-0000-0000-000000000001',
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/signed in|delete/i);
  });

  it('createItemReviewAction persists a review through the service layer', async () => {
    const result = await createItemReviewAction(itemId, 5, '  Nice item.  ');

    expect(result.success).toBe(true);
    expect(result.data?.content).toBe('Nice item.');
    expect(result.data?.user.id).toBe(testUser.id);
  });

  it('deleteItemReviewAction removes a review owned by the user', async () => {
    const created = await createItemReviewAction(itemId, 4, 'Delete me.');

    expect(created.success).toBe(true);

    const deleted = await deleteItemReviewAction(created.data!.id);

    expect(deleted).toEqual({ success: true });
  });

  it('createItemReviewAction returns a generic error for non-Error failures', async () => {
    vi.mocked(getSessionToken).mockRejectedValueOnce('down');

    const result = await createItemReviewAction(itemId, 5, 'Oops');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Could not submit review');
  });

  it('deleteItemReviewAction returns a generic error for non-Error failures', async () => {
    vi.mocked(getSessionToken).mockRejectedValueOnce('down');

    const result = await deleteItemReviewAction(
      '00000000-0000-0000-0000-000000000001',
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Could not delete review');
  });
});
