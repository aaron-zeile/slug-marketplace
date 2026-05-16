'use server';

import { checkLogin } from '../../buyer/login/actions';
import { createReview, getReviews } from '../../../item/review/service';
import { getItem, getRandomItems } from '../../../item/service';

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

export async function fetchItemReviewSessionAction() {
  try {
    const { user } = await checkLogin();
    return { loggedIn: Boolean(user) };
  } catch {
    return { loggedIn: false };
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
