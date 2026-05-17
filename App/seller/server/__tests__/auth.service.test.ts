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

    await expect(check('session-token')).resolves.toEqual(user)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4010/api/v0/login/check',
      {
        headers: {
          Authorization: 'Bearer session-token',
        },
      },
    )
  })

  it('returns undefined when the login service rejects the session', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    })

    await expect(check('session-token')).resolves.toBeUndefined()
  })
})
