import type { Server } from 'http';
import { expect, vi } from 'vitest';
import supertest from 'supertest';

export const testUser = {
  id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
  email: 'seller@example.com',
  name: 'Test Seller',
};

export interface CreatedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller: { id: string; name: string };
}

function getAuthorizationHeader(
  init?: RequestInit,
): string | undefined {
  const headers = init?.headers;
  if (headers instanceof Headers) {
    return headers.get('Authorization') ?? undefined;
  }
  if (headers && typeof headers === 'object' && 'Authorization' in headers) {
    return (headers as { Authorization?: string }).Authorization ?? undefined;
  }
  return undefined;
}

export function stubLoginFetch() {
  process.env.LOGIN_SERVICE_URL ??= 'http://localhost:4010/api/v0';

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/login/check')) {
        const authHeader = getAuthorizationHeader(init);
        if (!authHeader?.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }
        return new Response(JSON.stringify(testUser), { status: 200 });
      }

      throw new Error(`Unexpected fetch in test: ${url}`);
    }),
  );
}

export function mockUnauthenticatedLoginOnce() {
  vi.mocked(fetch).mockImplementationOnce(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (!url.includes('/login/check')) {
        throw new Error(`Unexpected fetch in test: ${url}`);
      }

      const authHeader = getAuthorizationHeader(init);
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
      }

      return new Response(JSON.stringify(testUser), { status: 200 });
    },
  );
}

export function expectGraphqlAuthError(body: {
  errors?: { message?: string }[];
  data?: Record<string, unknown>;
}) {
  expect(Array.isArray(body.errors)).toBe(true);
  const errors = body.errors as { message?: string }[];
  expect(errors.length).toBeGreaterThan(0);
  const message = errors.map((e) => e.message ?? '').join(' ');
  expect(message).toMatch(/Access denied|authorized|authenticate/i);
}

export async function createItemViaGraphql(
  server: Server,
  input: {
    name: string;
    description: string;
    images: string[];
    price: number;
    tags?: string[];
  },
): Promise<CreatedItem> {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer test-session-token')
    .send({
      query: `mutation CreateItem($input: NewItem!) {
        createItem(input: $input) {
          id
          name
          description
          price
          images
          seller {
            id
            name
          }
        }
      }`,
      variables: { input },
    });

  if (response.body.errors) {
    throw new Error(
      `createItem failed: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data.createItem as CreatedItem;
}
