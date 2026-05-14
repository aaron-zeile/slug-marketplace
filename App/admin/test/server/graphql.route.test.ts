import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockHandleRequest } = vi.hoisted(() => ({ mockHandleRequest: vi.fn() }));
vi.mock('@/graphql/server', () => ({
  getYoga: vi.fn().mockResolvedValue({ handleRequest: mockHandleRequest }),
}));

import { GET, POST } from '@/app/api/graphql/route';

describe('GraphQL API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET passes the request to yoga and returns its response', async () => {
    const expectedResponse = new Response('{"data":{}}', { status: 200 });
    mockHandleRequest.mockResolvedValue(expectedResponse);

    const req = new Request('http://localhost/api/graphql');
    const response = await GET(req);

    expect(mockHandleRequest).toHaveBeenCalledWith(
      req,
      expect.objectContaining({ request: req }),
    );
    expect(response).toBe(expectedResponse);
  });

  it('POST passes the request to yoga and returns its response', async () => {
    const expectedResponse = new Response('{"data":{"health":true}}', { status: 200 });
    mockHandleRequest.mockResolvedValue(expectedResponse);

    const req = new Request('http://localhost/api/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: '{ health }' }),
    });
    const response = await POST(req);

    expect(mockHandleRequest).toHaveBeenCalledWith(
      req,
      expect.objectContaining({ request: req }),
    );
    expect(response).toBe(expectedResponse);
  });

  it('GET creates a fresh responseHeaders object for each request', async () => {
    mockHandleRequest.mockResolvedValue(new Response());

    const req1 = new Request('http://localhost/api/graphql');
    const req2 = new Request('http://localhost/api/graphql');
    await GET(req1);
    await GET(req2);

    const [call1, call2] = mockHandleRequest.mock.calls;
    expect(call1[1].responseHeaders).not.toBe(call2[1].responseHeaders);
  });
});
