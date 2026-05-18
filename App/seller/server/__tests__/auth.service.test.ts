import {beforeEach, describe, expect, it, vi} from 'vitest'
import {check} from '../auth/service.js'

describe('auth service', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('returns the checked session user', async () => {
    const user = {
      id: 'seller-1',
      email: 'seller@example.com',
      name: 'Test Seller',
    }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => user,
    })

    const result = await check('session-token')

    expect({
      result,
      fetchCall: fetchMock.mock.calls[0],
    }).toEqual({
      result: user,
      fetchCall: [
        'http://localhost:4010/api/v0/login/check',
        {
          headers: {
            Authorization: 'Bearer session-token',
          },
        },
      ],
    })
  })

  it('returns undefined when the login service rejects the session', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    })

    await expect(check('session-token')).resolves.toBeUndefined()
  })
})
