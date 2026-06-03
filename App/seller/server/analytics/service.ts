
const ITEMS_SERVICE_URL = process.env.ITEMS_SERVICE_URL || 'http://localhost:4500/graphql';
const GET_AVG_RATING = `
  query GetAvgRating($id: String!) {
    getAvgRating(input: {id: $id})
  }
`;

const GET_SELLER_ITEMS_QUERY = `
  query GetSellerItems($id: String!, $status: String!) {
    sellerItems(input: {id: $id, status: $status}) {
      id
    }
  }
`;

const GET_REVIEWS_QUERY = `
  query GetReviews($input: ItemId!) {
    reviews(input: $input) {
      rating
    }
  }
`;

interface GraphQLErrorResponse {
  errors?: {
    message?: string
  }[]
}

type SellerItemsResponse = GraphQLErrorResponse & {
  data?: {
    sellerItems?: {
      id: string
    }[]
  }
}

type ReviewsResponse = GraphQLErrorResponse & {
  data?: {
    reviews?: {
      rating: number
    }[]
  }
}

const throwGraphQLError = (body: GraphQLErrorResponse) => {
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message ?? 'GraphQL error')
  }
}

const emptyDistribution = () => [0, 0, 0, 0, 0]

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

  public async getStarDistribution(sellerId: string): Promise<number[]> {
    const items = await Promise.all([
      this.getSellerItems(sellerId, 'active'),
      this.getSellerItems(sellerId, 'sold'),
    ])
    const itemIds = items.flat().map((item) => item.id)
    const reviews = await Promise.all(
      itemIds.map((id) => this.getReviews(id)),
    )
    const distribution = emptyDistribution()

    for (const review of reviews.flat()) {
      const bucket = Math.min(Math.max(Math.round(review.rating), 1), 5)
      distribution[bucket - 1] = (distribution[bucket - 1] ?? 0) + 1
    }

    return distribution
  }

  private async getSellerItems(
    sellerId: string,
    status: 'active' | 'sold',
  ): Promise<{id: string}[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_SELLER_ITEMS_QUERY,
        variables: {
          id: sellerId,
          status,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get seller items: ${response.statusText}`)
    }

    const body = await response.json() as SellerItemsResponse
    throwGraphQLError(body)
    return body.data?.sellerItems ?? []
  }

  private async getReviews(itemId: string): Promise<{rating: number}[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_REVIEWS_QUERY,
        variables: {
          input: {
            id: itemId,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get item reviews: ${response.statusText}`)
    }

    const body = await response.json() as ReviewsResponse
    throwGraphQLError(body)
    return body.data?.reviews ?? []
  }
}
