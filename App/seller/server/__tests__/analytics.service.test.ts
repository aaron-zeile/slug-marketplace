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

  it('gets the seller average rating', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          getAvgRating: 4.25,
        },
      }),
    })

    const rating = await new AnalyticsService().getAvgRating('seller-1')

    expect({
      rating,
      fetchCall: fetchMock.mock.calls[0],
    }).toEqual({
      rating: 4.25,
      fetchCall: [
        'http://localhost:4500/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: expect.stringContaining('"id":"seller-1"'),
        }),
      ],
    })
  })

  it('returns zero when the average rating is omitted', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {},
      }),
    })

    await expect(new AnalyticsService().getAvgRating('seller-1')).resolves.toBe(0)
  })

  it('throws when average rating receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
    })

    await expect(
      new AnalyticsService().getAvgRating('seller-1'),
    ).rejects.toThrow('Failed to get average rating: Bad Gateway')
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

  it('throws when seller item fetching receives a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
    })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).rejects.toThrow('Failed to get seller items: Service Unavailable')
  })

  it('uses empty seller item lists when item data is omitted', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: {}}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: {}}),
      })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).resolves.toEqual([0, 0, 0, 0, 0])
  })

  it('throws when review fetching receives a non-ok response', async () => {
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
            sellerItems: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).rejects.toThrow('Failed to get item reviews: Service Unavailable')
  })

  it('throws the fallback graphql error while fetching reviews', async () => {
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
            sellerItems: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{}],
        }),
      })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).rejects.toThrow('GraphQL error')
  })

  it('uses empty review lists when review data is omitted', async () => {
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
            sellerItems: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: {}}),
      })

    await expect(
      new AnalyticsService().getStarDistribution('seller-1'),
    ).resolves.toEqual([0, 0, 0, 0, 0])
  })
})
