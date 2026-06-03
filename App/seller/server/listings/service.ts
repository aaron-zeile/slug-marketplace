import { z } from 'zod';
import {
  DiscountSchema,
  ListingSchema,
  NewDiscountSchema,
  NewListingSchema,
  type Discount,
  type Listing,
  type NewDiscount,
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
      quantity
      created_at
      images
      status
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
      quantity
      created_at
      images
      status
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
      quantity
      created_at
      images
      status
    }
  }
`;

const GET_REVIEWS_QUERY = `
  query GetReviews($input: ItemId!) {
    reviews(input: $input) {
      id
      user { id name }
      rating
      content
      created_at
    }
  }
`;

const GET_DISCOUNTS_QUERY = `
  query GetDiscountsByItem($input: ItemId!) {
    discountsByItem(input: $input) {
      id
      itemId
      discountPercent
      duration
      created_at
    }
  }
`;

const CREATE_DISCOUNT_MUTATION = `
  mutation CreateDiscount($input: NewDiscount!) {
    createDiscount(input: $input) {
      id
      itemId
      discountPercent
      duration
      created_at
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

interface GetReviewsResponse {
  data?: {
    reviews?: unknown[]
  }
  errors?: { message?: string }[]
}

interface GetDiscountsResponse {
  data?: {
    discountsByItem?: unknown[]
  }
  errors?: { message?: string }[]
}

interface CreateDiscountResponse {
  data?: {
    createDiscount?: unknown
  }
  errors?: { message?: string }[]
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

  public async getReviews(itemId: string): Promise<unknown[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_REVIEWS_QUERY,
        variables: { input: { id: itemId } },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    const body = await response.json() as GetReviewsResponse;

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    return body.data?.reviews ?? [];
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

  public async getDiscounts(itemId: string): Promise<Discount[]> {
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_DISCOUNTS_QUERY,
        variables: { input: { id: itemId } },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch discounts: ${response.statusText}`);
    }

    const body = await response.json() as GetDiscountsResponse;

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = z
      .array(DiscountSchema)
      .safeParse(body.data?.discountsByItem ?? []);

    if (!parseResult.success) {
      throw new Error(
        'Discounts response did not match expected discount schema',
      );
    }

    return parseResult.data;
  }

  public async createDiscount(
    input: NewDiscount,
    sessionToken: string,
  ): Promise<Discount> {
    const discountInput = NewDiscountSchema.parse(input);
    const response = await fetch(ITEMS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        query: CREATE_DISCOUNT_MUTATION,
        variables: {
          input: discountInput,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create discount: ${response.statusText}`);
    }

    const body = await response.json() as CreateDiscountResponse;

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }

    const parseResult = DiscountSchema.safeParse(body.data?.createDiscount);

    if (!parseResult.success) {
      throw new Error(
        'Created discount response did not match expected discount schema',
      );
    }

    return parseResult.data;
  }
}
