import {afterEach, describe, expect, it, vi} from 'vitest'

describe('server index', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalPort = process.env.PORT

  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    process.env.NODE_ENV = originalNodeEnv
    process.env.PORT = originalPort
  })

  it('starts the server on the configured port', async () => {
    const app = {
      listen: vi.fn((_port: number, callback: () => void) => callback()),
      use: vi.fn(),
      get: vi.fn(),
    }
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    vi.doMock('../app.js', () => ({
      default: app,
    }))

    process.env.NODE_ENV = 'test'
    process.env.PORT = '4010'

    await import('../index.js')

    expect({
      listenPort: app.listen.mock.calls[0]?.[0],
      useCalls: app.use.mock.calls,
      getCalls: app.get.mock.calls,
      logCalls: log.mock.calls,
    }).toEqual({
      listenPort: 4010,
      useCalls: [],
      getCalls: [],
      logCalls: [['Server listening on http://localhost:4010']],
    })
  })

  it('serves the built client in production', async () => {
    const app = {
      listen: vi.fn((_port: number, callback: () => void) => callback()),
      use: vi.fn(),
      get: vi.fn(),
    }
    const staticMiddleware = vi.fn()
    const expressStatic = vi.fn(() => staticMiddleware)
    const sendFile = vi.fn()

    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.doMock('express', () => ({
      default: {
        static: expressStatic,
      },
    }))
    vi.doMock('../app.js', () => ({
      default: app,
    }))

    process.env.NODE_ENV = 'production'
    delete process.env.PORT

    await import('../index.js')

    const [, fallbackHandler] = app.get.mock.calls[0] as [
      RegExp,
      (_request: unknown, response: {sendFile: typeof sendFile}) => void,
    ]
    fallbackHandler({}, {sendFile})

    const staticCall = expressStatic.mock.calls[0] as unknown[] | undefined
    const staticDir = String(staticCall?.[0]).replaceAll('\\', '/')
    const sentFile = String(sendFile.mock.calls[0]?.[0]).replaceAll('\\', '/')

    expect({
      staticDir,
      sellerStaticMount: app.use.mock.calls[0]?.[0],
      usedSellerStaticMiddleware: app.use.mock.calls[0]?.[1],
      rootStaticMiddleware: app.use.mock.calls[1]?.[0],
      fallbackPattern: app.get.mock.calls[0]?.[0],
      sentFile,
      listenPort: app.listen.mock.calls[0]?.[0],
    }).toEqual({
      staticDir: expect.stringContaining('/client/dist'),
      sellerStaticMount: '/seller',
      usedSellerStaticMiddleware: staticMiddleware,
      rootStaticMiddleware: staticMiddleware,
      fallbackPattern: /.*/,
      sentFile: expect.stringContaining('/client/dist/index.html'),
      listenPort: 3010,
    })
  })
})
