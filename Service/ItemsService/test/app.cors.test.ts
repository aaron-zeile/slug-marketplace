import * as http from 'http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';

describe('app CORS defaults', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  afterEach(() => {
    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }
    vi.resetModules();
  });

  it('uses http://localhost:3000 when CORS_ORIGIN is unset', async () => {
    delete process.env.CORS_ORIGIN;
    vi.resetModules();

    const { app, bootstrap } = await import('../src/app');
    await bootstrap();

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(resolve));

    const defaultOrigin = 'http://localhost:3000';

    const getResponse = await supertest(server)
      .get('/playground')
      .set('Origin', defaultOrigin);

    expect(getResponse.headers['access-control-allow-origin']).toBe(
      defaultOrigin,
    );

    const optionsResponse = await supertest(server)
      .options('/graphql')
      .set('Origin', defaultOrigin)
      .set('Access-Control-Request-Method', 'POST');

    expect(optionsResponse.headers['access-control-allow-origin']).toBe(
      defaultOrigin,
    );

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
});
