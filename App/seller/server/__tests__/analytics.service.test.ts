import {beforeEach, describe, expect, it, vi} from 'vitest'
import {AnalyticsService} from '../analytics/service.js'

describe('AnalyticsService', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('builds a star distribution from all seller item reviews', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            sellerItems: [{id: 'active-item'}],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            sellerItems: [{id: 'sold-item'}],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            reviews: [{rating: 1.2}, {rating: 3.4}],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            reviews: [{rating: 1.6}, {rating: 4.5}],
          },
        }),
      })

    const ratings = await new AnalyticsService().getStarDistribution('seller-1')

    expect({
      ratings,
      fetchCalls: fetchMock.mock.calls.length,
    }).toEqual({
      ratings: [1, 1, 1, 0, 1],
      fetchCalls: 4,
    })
  })

  it('throws the graphql error message while fetching seller items', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{message: 'Seller item query failed'}],
      }),
    })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).rejects.toThrow('Seller item query failed')
  })
})
