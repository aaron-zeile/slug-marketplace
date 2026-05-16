import 'server-only';

import { getSessionToken } from '../../server/auth/service';
import { ReviewSchema } from '../../shared/review';
import type { Review } from '.';

const ITEMS_SERVICE_URL =
  process.env.ITEMS_SERVICE_URL || 'http://localhost:4000/graphql';

export async function getReviews(itemId: string): Promise<Review[]> {
  const query = `
    query GetReviews($input: ItemId!) {
      reviews(input: $input) {
        id 
        user {
          id
          name
        }
        rating
        content
        created_at
      }
    }`;

  const response = await fetch(ITEMS_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        input: { id: itemId },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error('GraphQL error');
  }

  return body.data?.reviews || [];
}

export async function createReview(
  itemId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const token = await getSessionToken();
  if (!token) {
    throw new Error('Not signed in');
  }

  const mutation = `
    mutation CreateReview($input: NewReview!) {
      createReview(input: $input) {
        id
        user {
          id
          name
        }
        rating
        content
        created_at
      }
    }
  `;

  const response = await fetch(ITEMS_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: { itemId, rating, comment },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to create review: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    const message =
      typeof body.errors[0]?.message === 'string'
        ? body.errors[0].message
        : 'GraphQL error';
    throw new Error(message);
  }

  const raw = body.data?.createReview;
  return ReviewSchema.parse(raw);
}
