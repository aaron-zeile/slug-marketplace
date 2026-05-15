import { beforeAll, afterAll, beforeEach } from 'vitest'
import * as http from 'http'

import * as db from './db'
import { app, bootstrap } from '../src/app'

export let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll( async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()
})

beforeEach(async () => {
  await db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
})
