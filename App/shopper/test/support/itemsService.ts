import * as http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, vi } from 'vitest';

const itemsServiceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../Service/ItemsService',
);

type ItemsModules = {
  app: typeof import('../../../../Service/ItemsService/src/app').app;
  bootstrap: typeof import('../../../../Service/ItemsService/src/app').bootstrap;
  reset: () => Promise<void>;
  resetSchema: () => Promise<void>;
  shutdown: () => void;
  createItemViaGraphql: typeof import('../../../../Service/ItemsService/test/helpers').createItemViaGraphql;
  stubLoginFetch: typeof import('../../../../Service/ItemsService/test/helpers').stubLoginFetch;
  testUser: typeof import('../../../../Service/ItemsService/test/helpers').testUser;
};

let modules: ItemsModules;
let server: http.Server | undefined;
let graphqlUrl: string;

async function runInItemsServiceRoot<T>(fn: () => Promise<T>): Promise<T> {
  const previous = process.cwd();
  process.chdir(itemsServiceRoot);
  dotenv.config({ path: path.join(itemsServiceRoot, '.env'), override: true });
  try {
    return await fn();
  } finally {
    process.chdir(previous);
  }
}

async function loadModules(): Promise<ItemsModules> {
  return runInItemsServiceRoot(async () => {
    vi.resetModules();
    const appModule = await import('../../../../Service/ItemsService/src/app');
    const dbModule = await import('../../../../Service/ItemsService/test/db');
    const helpersModule = await import('../../../../Service/ItemsService/test/helpers');

    return {
      app: appModule.app,
      bootstrap: appModule.bootstrap,
      reset: dbModule.reset,
      resetSchema: dbModule.resetSchema,
      shutdown: dbModule.shutdown,
      createItemViaGraphql: helpersModule.createItemViaGraphql,
      stubLoginFetch: helpersModule.stubLoginFetch,
      testUser: helpersModule.testUser,
    };
  });
}

export function getItemsServiceGraphqlUrl(): string {
  if (!graphqlUrl) {
    throw new Error('ItemsService test server has not been started');
  }
  return graphqlUrl;
}

export async function startItemsServiceForTests(): Promise<string> {
  if (graphqlUrl) {
    return graphqlUrl;
  }

  modules ??= await loadModules();

  await runInItemsServiceRoot(async () => {
    modules.stubLoginFetch();
    server = http.createServer(modules.app);
    await new Promise<void>((resolve) => server!.listen(resolve));
    await modules.bootstrap();
    await modules.resetSchema();
  });

  const address = server!.address();
  if (!address || typeof address === 'string') {
    throw new Error('ItemsService test server did not start');
  }

  graphqlUrl = `http://127.0.0.1:${address.port}/graphql`;
  process.env.ITEMS_SERVICE_URL = graphqlUrl;
  return graphqlUrl;
}

function getAuthorizationHeader(init?: RequestInit): string | undefined {
  const headers = init?.headers;
  if (headers instanceof Headers) {
    return headers.get('Authorization') ?? undefined;
  }
  if (headers && typeof headers === 'object' && 'Authorization' in headers) {
    return (headers as { Authorization?: string }).Authorization ?? undefined;
  }
  return undefined;
}

/** Keep login-check stubbed; pass other fetch calls through to the real network stack. */
export function releaseFetchStubForServiceTests() {
  vi.unstubAllGlobals();
  const realFetch = globalThis.fetch.bind(globalThis);
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

      return realFetch(input, init);
    }),
  );
}

export async function seedItemsServiceItem(input: {
  name: string;
  description: string;
  images: string[];
  price: number;
  tags?: string[];
  quantity?: number;
}) {
  if (!server) {
    await startItemsServiceForTests();
  }

  return runInItemsServiceRoot(() =>
    modules.createItemViaGraphql(server!, input),
  );
}

export const testUser = {
  id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
  email: 'seller@example.com',
  name: 'Test Seller',
};

export function restubLoginFetchForServiceTests() {
  modules?.stubLoginFetch();
}

export function registerItemsServiceHooks() {
  beforeAll(async () => {
    modules ??= await loadModules();
    await startItemsServiceForTests();
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    if (modules) {
      await runInItemsServiceRoot(() => modules.reset());
      modules.shutdown();
    }
    server?.close();
    server = undefined;
    graphqlUrl = '';
  });
}
