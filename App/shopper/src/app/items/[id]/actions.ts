'use server';

import { checkLogin } from '../../buyer/login/actions';
import { buyerHasOrderedItem } from '../../../order/service';
import {
  createReview,
  deleteReview,
  getReviews,
} from '../../../item/review/service';
import { getItem, getRandomItems } from '../../../item/service';
import { recordViewedItem } from '../../../viewed/service';

export async function fetchItemAction(id: string) {
  try {
    const item = await getItem(id);
    return { success: true, data: item };
  } catch (error) {
    console.error('fetchItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchRandomItemsAction(count: number) {
  try {
    const items = await getRandomItems(count);
    return { success: true, data: items };
  } catch (error) {
    console.error('fetchRandomItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchItemReviewsAction(id: string) {
  try {
    const reviews = await getReviews(id);
    return { success: true, data: reviews };
  } catch (error) {
    console.error('fetchItemReviewsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchItemReviewSessionAction(itemId: string) {
  try {
    const { user } = await checkLogin();
    if (!user) {
      return { loggedIn: false as const };
    }

    const canReview = await buyerHasOrderedItem(user.id, itemId);

    return {
      loggedIn: true as const,
      userId: user.id,
      canReview,
    };
  } catch {
    return { loggedIn: false as const };
  }
}

export async function recordViewedItemAction(itemId: string) {
  try {
    const { user } = await checkLogin();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const viewedItem = await recordViewedItem(user.id, itemId);
    return { success: true as const, data: viewedItem };
  } catch (error) {
    console.error('recordViewedItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false as const, error: message };
  }
}

export async function createItemReviewAction(
  itemId: string,
  rating: number,
  comment: string,
) {
  try {
    const review = await createReview(itemId, rating, comment.trim());
    return { success: true as const, data: review };
  } catch (error) {
    console.error('createItemReviewAction error:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Could not submit review';
    return { success: false as const, error: message };
  }
}

export async function deleteItemReviewAction(reviewId: string) {
  try {
    await deleteReview(reviewId);
    return { success: true as const };
  } catch (error) {
    console.error('deleteItemReviewAction error:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Could not delete review';
    return { success: false as const, error: message };
  }
}

export async function submitReportAction(payload: {
  type: 'item' | 'review';
  targetId: string;
  targetName: string;
  reason: string;
  description?: string;
}): Promise<{ success: boolean; error?: string }> {
  const adminUrl = process.env.ADMIN_URL ?? 'http://localhost:3002';
  const secret = process.env.ADMIN_INTERNAL_SECRET ?? 'dev-internal-secret';

  let reporterName = 'Anonymous';
  try {
    const { user } = await checkLogin();
    if (user) reporterName = user.name;
  } catch {
    // not logged in — report anonymously
  }

  try {
    const res = await fetch(`${adminUrl}/admin/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': secret,
      },
      body: JSON.stringify({ ...payload, reporterName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: (body as { error?: string }).error ?? 'Failed to submit report' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Could not reach the server. Please try again.' };
  }
}
