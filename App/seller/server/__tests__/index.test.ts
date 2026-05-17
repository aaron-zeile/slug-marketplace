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

    expect(app.listen).toHaveBeenCalledWith(4010, expect.any(Function))
    expect(app.use).not.toHaveBeenCalled()
    expect(app.get).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('Server listening on http://localhost:4010')
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

    expect(expressStatic).toHaveBeenCalledWith(
      expect.stringContaining('/client/dist'),
    )
    expect(app.use).toHaveBeenCalledWith(staticMiddleware)
    expect(app.get).toHaveBeenCalledWith(/.*/, expect.any(Function))

    const [, fallbackHandler] = app.get.mock.calls[0]
    fallbackHandler({}, {sendFile})

    expect(sendFile).toHaveBeenCalledWith(
      expect.stringContaining('/client/dist/index.html'),
    )
    expect(app.listen).toHaveBeenCalledWith(3010, expect.any(Function))
  })
})
