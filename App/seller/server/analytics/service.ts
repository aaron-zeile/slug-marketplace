
const ITEMS_SERVICE_URL = process.env.ITEMS_SERVICE_URL || 'http://localhost:4500/graphql';
const GET_AVG_RATING = `
  query GetAvgRating($id: String!) {
    getAvgRating(input: {id: $id})
  }
`;

export class AnalyticsService {
  public async getAvgRating(sellerId: string):
  Promise<number> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: GET_AVG_RATING,
        variables: {
          id: sellerId
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to get average rating: ${response.statusText}`);
    }
    const body = await response.json() as {
      data?: {getAvgRating?: number}
      errors?: {message?: string}[]
    }
    return body.data?.getAvgRating ?? 0
  }
}