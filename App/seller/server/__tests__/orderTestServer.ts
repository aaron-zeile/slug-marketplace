import type * as http from 'http'

type OrderServiceModule = typeof import('../../../../Service/Order/src/order/service')
type OrderDbModule = typeof import('../../../../Service/Order/src/db')
type OrderAppModule = typeof import('../../../../Service/Order/src/app')

let server: http.Server | undefined
let serviceModule: OrderServiceModule | undefined
let dbModule: OrderDbModule | undefined

export const sellerId = '11111111-1111-4111-8111-111111111111'
export const otherSellerId = '22222222-2222-4222-8222-222222222222'
export const buyerId = '33333333-3333-4333-8333-333333333333'

export function configureOrderDatabaseEnv() {
  process.env.POSTGRES_HOST = 'localhost'
  process.env.POSTGRES_PORT = '5435'
  process.env.POSTGRES_USER = 'postgres'
  process.env.POSTGRES_PASSWORD = 'postgres'
  process.env.ORDER_POSTGRES_DB = 'orders'
}

export async function startOrderGraphqlServer(): Promise<string> {
  configureOrderDatabaseEnv()

  const httpModule = await import('http')
  const appModule: OrderAppModule = await import(
    '../../../../Service/Order/src/app'
  )
  dbModule = await import('../../../../Service/Order/src/db')
  serviceModule = await import('../../../../Service/Order/src/order/service')

  server = httpModule.createServer(appModule.app)
  await new Promise<void>((resolve) => {
    server?.listen(0, '127.0.0.1', resolve)
  })
  await appModule.bootstrap()

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Order GraphQL test server did not start on a TCP port')
  }

  return `http://127.0.0.1:${address.port}/graphql`
}

export async function resetOrderDatabase() {
  if (!dbModule) {
    throw new Error('Order database module has not been loaded')
  }

  await dbModule.pool.query('TRUNCATE order_item, buyer_order')
}

export async function seedSellerOrders() {
  if (!serviceModule) {
    throw new Error('Order service module has not been loaded')
  }

  const service = new serviceModule.OrderService()
  const sellerOrder = await service.createOrder({
    buyer: buyerId,
    buyerEmail: 'buyer@example.com',
    purchaseAmount: 24.99,
    address: {
      label: 'Home',
      line1: '1156 High Street',
      city: 'Santa Cruz',
      state: 'CA',
      postalCode: '95064',
      country: 'US',
    },
    items: [
      {
        itemId: '44444444-4444-4444-8444-444444444444',
        sellerId,
      },
    ],
  })

  await service.createOrder({
    buyer: buyerId,
    buyerEmail: 'buyer@example.com',
    purchaseAmount: 15.5,
    address: {
      line1: '500 Other Street',
      city: 'Santa Cruz',
      state: 'CA',
      postalCode: '95064',
      country: 'US',
    },
    items: [
      {
        itemId: '55555555-5555-4555-8555-555555555555',
        sellerId: otherSellerId,
      },
    ],
  })

  return sellerOrder
}

export async function stopOrderGraphqlServer() {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
    server = undefined
  }

  await dbModule?.pool.end()
  dbModule = undefined
  serviceModule = undefined
}
