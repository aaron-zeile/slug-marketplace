import 'server-only';
import { Review } from '.';

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
