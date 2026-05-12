import 'server-only';

const ITEMS_SERVICE_URL =
  process.env.ITEMS_SERVICE_URL || 'http://localhost:4000/graphql';



export async function getReviews(itemId: string) {
  const query = `
    query GetReviews($input: ItemId!) {
      reviews(input: $input) {
        id 
        reviewer {
          id
          name
        }
        rating
        content
        created_at
      }
        }`;