import { z } from 'zod';
import {
  ListingSchema,
  NewListingSchema,
  type Listing,
  type NewListing,
} from '../../shared/index.js';

const ITEMS_SERVICE_URL = process.env.ITEMS_SERVICE_URL || 'http://localhost:4500/graphql';

const GET_ITEMS_QUERY = `
  query GetSellerItems($id: String!, $status: String!) {
    sellerItems(input: {id: $id, status: $status}) {
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

const CREATE_ITEM_MUTATION = `
  mutation CreateItem($input: NewItem!) {
    createItem(input: $input) {
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

const DELETE_ITEM_MUTATION = `
  mutation DeleteItem($id: String!) {
    deleteItem(input: { id: $id })
  }
`;

const UPDATE_ITEM_MUTATION = `
  mutation UpdateItem($input: UpdateItem!) {
    updateItem(input: $input) {
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

interface SellerItemsResponse {
  data?: {
    sellerItems?: unknown
  }
  errors?: {
    message?: string
  }[]
}

interface CreateItemResponse {
  data?: {
    createItem?: unknown
  }
  errors?: {
    message?: string
  }[]
}

interface DeleteItemResponse {
  data?: {
    deleteItem?: unknown
  }
  errors?: {
    message?: string
  }[]
}

type UpdateItemResponse = {
  data?: {
    updateItem?: unknown
  }
  errors?: Array<{
    message?: string
  }>
}

export class ListingService {
  public async getListings(sellerId: string, status: 'active' | 'sold'): Promise<Listing[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ITEMS_QUERY,
        variables: {
          id: sellerId,
          status,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const body = await response.json() as SellerItemsResponse

    if (body.errors?.length) {
      console.log(JSON.stringify(body, null, 2))
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

  public async createListing(
    input: NewListing,
    sessionToken: string,
  ): Promise<Listing> {
    const listingInput = NewListingSchema.parse(input)
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        query: CREATE_ITEM_MUTATION,
        variables: {
          input: listingInput,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create listing: ${response.statusText}`);
    }

    const body = await response.json() as CreateItemResponse

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = ListingSchema.safeParse(body.data?.createItem);

    if (!parseResult.success) {
      throw new Error(
        'Created item response did not match expected listing schema',
      );
    }

    return parseResult.data;
  }

  public async deleteListing(
    itemId: string,
    sessionToken: string,
  ): Promise<void> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        query: DELETE_ITEM_MUTATION,
        variables: {
          id: itemId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete listing: ${response.statusText}`);
    }

    const body = await response.json() as DeleteItemResponse

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    if (body.data?.deleteItem !== true) {
      throw new Error('Delete item response did not confirm deletion');
    }
  }

  public async updateListing(
    itemId: string,
    input: NewListing,
    sessionToken: string,
  ): Promise<Listing> {
    const listingInput = NewListingSchema.parse(input)
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        query: UPDATE_ITEM_MUTATION,
        variables: {
          input: {
            id: itemId,
            ...listingInput,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update listing: ${response.statusText}`);
    }

    const body = await response.json() as UpdateItemResponse

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = ListingSchema.safeParse(body.data?.updateItem);

    if (!parseResult.success) {
      throw new Error(
        'Updated item response did not match expected listing schema',
      );
    }

    return parseResult.data;
  }
}
