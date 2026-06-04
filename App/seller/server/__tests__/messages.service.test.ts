import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {MessageService} from '../messages/service.js'

const seller = {
  id: 'seller-1',
  name: 'Test Seller',
  email: 'seller@example.com',
}

const input = {
  subject: 'Help with listing',
  body: 'I need help reviewing my new listing.',
}

describe('MessageService', () => {
  const fetchMock = vi.fn()
  const originalAdminApiUrl = process.env.ADMIN_API_URL
  const originalAdminInternalSecret = process.env.ADMIN_INTERNAL_SECRET

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    if (originalAdminApiUrl === undefined) {
      delete process.env.ADMIN_API_URL
    } else {
      process.env.ADMIN_API_URL = originalAdminApiUrl
    }
    if (originalAdminInternalSecret === undefined) {
      delete process.env.ADMIN_INTERNAL_SECRET
    } else {
      process.env.ADMIN_INTERNAL_SECRET = originalAdminInternalSecret
    }
  })

  it('posts the message to the admin service with the internal secret header', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    })

    await new MessageService().sendMessage(seller, input)

    const [, request] = fetchMock.mock.calls[0] as [
      string,
      {body: string; headers: Record<string, string>; method: string},
    ]
    const body = JSON.parse(request.body)

    expect({
      url: fetchMock.mock.calls[0]?.[0],
      method: request.method,
      headers: request.headers,
      body,
    }).toEqual({
      url: 'http://localhost:3002/admin/api/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': 'dev-internal-secret',
      },
      body: {
        sellerId: seller.id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        subject: input.subject,
        body: input.body,
      },
    })
  })

  it('uses ADMIN_API_URL and ADMIN_INTERNAL_SECRET from the environment when set', async () => {
    process.env.ADMIN_API_URL = 'http://admin.example.com:9000'
    process.env.ADMIN_INTERNAL_SECRET = 'top-secret-token'
    fetchMock.mockResolvedValue({ok: true})

    vi.resetModules()
    const {MessageService: FreshMessageService} = await import(
      '../messages/service.js'
    )

    await new FreshMessageService().sendMessage(seller, input)

    const [url, request] = fetchMock.mock.calls[0] as [
      string,
      {headers: Record<string, string>},
    ]

    expect({
      url,
      secretHeader: request.headers['X-Internal-Secret'],
    }).toEqual({
      url: 'http://admin.example.com:9000/admin/api/messages',
      secretHeader: 'top-secret-token',
    })
  })

  it('throws when the admin service responds with a non-ok status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
    })

    await expect(new MessageService().sendMessage(seller, input)).rejects.toThrow(
      'Failed to send message: Forbidden',
    )
  })

  it('propagates network errors thrown by fetch', async () => {
    fetchMock.mockRejectedValue(new Error('Network down'))

    await expect(new MessageService().sendMessage(seller, input)).rejects.toThrow(
      'Network down',
    )
  })
})
