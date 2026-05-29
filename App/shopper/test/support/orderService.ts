import type * as http from 'http';
import { afterAll, beforeAll } from 'vitest';

type OrderServiceModule = typeof import('../../../../Service/Order/src/order/service');
type OrderDbModule = typeof import('../../../../Service/Order/src/db');
type OrderAppModule = typeof import('../../../../Service/Order/src/app');

let server: http.Server | undefined;
let serviceModule: OrderServiceModule | undefined;
let dbModule: OrderDbModule | undefined;
let graphqlUrl = '';

export function configureOrderDatabaseEnv() {
  process.env.POSTGRES_HOST = 'localhost';
  process.env.POSTGRES_PORT = '5435';
  process.env.POSTGRES_USER = 'postgres';
  process.env.POSTGRES_PASSWORD = 'postgres';
  process.env.ORDER_POSTGRES_DB = 'orders';
}

export async function startOrderServiceForTests(): Promise<string> {
  if (graphqlUrl) {
    return graphqlUrl;
  }

  configureOrderDatabaseEnv();

  const httpModule = await import('http');
  const appModule: OrderAppModule = await import(
    '../../../../Service/Order/src/app'
  );
  dbModule = await import('../../../../Service/Order/src/db');
  serviceModule = await import('../../../../Service/Order/src/order/service');

  server = httpModule.createServer(appModule.app);
  await new Promise<void>((resolve) => {
    server?.listen(0, '127.0.0.1', resolve);
  });
  await appModule.bootstrap();

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Order GraphQL test server did not start on a TCP port');
  }

  graphqlUrl = `http://127.0.0.1:${address.port}/graphql`;
  process.env.ORDER_SERVICE_URL = graphqlUrl;
  return graphqlUrl;
}

export async function resetOrderDatabase() {
  if (!dbModule) {
    throw new Error('Order database module has not been loaded');
  }

  await dbModule.pool.query('TRUNCATE order_item, buyer_order');
}

export async function seedBuyerOrderForItem(
  buyer: string,
  itemId: string,
  sellerId: string,
) {
  if (!serviceModule) {
    throw new Error('Order service module has not been loaded');
  }

  return new serviceModule.OrderService().createOrder({
    buyer,
    purchaseAmount: 9.99,
    address: {
      line1: '1 Test Street',
      city: 'Santa Cruz',
      state: 'CA',
      postalCode: '95064',
      country: 'US',
    },
    items: [{ itemId, sellerId }],
  });
}

export function registerOrderServiceHooks() {
  beforeAll(async () => {
    await startOrderServiceForTests();
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      server = undefined;
    }

    await dbModule?.pool.end();
    dbModule = undefined;
    serviceModule = undefined;
    graphqlUrl = '';
  });
}
