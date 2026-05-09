import { z } from 'zod';
import { ListingSchema, type Listing } from '../../shared/index.js';

const ITEMS_SERVICE_URL = 'http://localhost:4000/graphql';

const TEMP_SELLER_ID = '7b355067-1dee-4b9a-a87a-fa745332ecf8';

const GET_ITEMS_QUERY = `
  query GetSellerItems($id: String!) {
    sellerItems(input: { id: $id }) {
      id
      seller {
        id
        name
      }
      name
      description
      price
      created_at
      images
    }
  }
`;

type SellerItemsResponse = {
  data?: {
    sellerItems?: unknown
  }
  errors?: Array<{
    message?: string
  }>
}

export class ListingService {
  public async getListings(): Promise<Listing[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ITEMS_QUERY,
        variables: {
          id: TEMP_SELLER_ID,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    // FIX THIS SO IT IS NOT SET TO AS ANY!!!!!!!!!!!
    const body = await response.json() as SellerItemsResponse

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = z
      .array(ListingSchema)
      .safeParse(body.data?.sellerItems);

    if (!parseResult.success) {
      throw new Error(
        'Seller items response did not match expected listing schema',
      );
    }

    return parseResult.data;
  }
}
