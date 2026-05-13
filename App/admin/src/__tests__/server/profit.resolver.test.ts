import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));

import { ProfitResolver } from '@/graphql/schema/profit.resolver';

describe('ProfitResolver.monthlyProfit', () => {
  const resolver = new ProfitResolver();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped monthly profit data', async () => {
    const rows = [
      { month: new Date('2024-01-01T00:00:00Z'), profit: '1500.50' },
      { month: new Date('2024-02-01T00:00:00Z'), profit: '2300.75' },
    ];
    mockSql.mockResolvedValue(rows);

    const result = await resolver.monthlyProfit();

    expect(result).toEqual([
      { month: '2024-01', profit: 1500.5 },
      { month: '2024-02', profit: 2300.75 },
    ]);
  });

  it('returns an empty array when there are no rows', async () => {
    mockSql.mockResolvedValue([]);

    const result = await resolver.monthlyProfit();

    expect(result).toEqual([]);
  });

  it('queries the database exactly once', async () => {
    mockSql.mockResolvedValue([]);

    await resolver.monthlyProfit();

    expect(mockSql).toHaveBeenCalledOnce();
  });

  it('parses profit string as a float', async () => {
    mockSql.mockResolvedValue([
      { month: new Date('2024-03-01T00:00:00Z'), profit: '999.99' },
    ]);

    const [row] = await resolver.monthlyProfit();

    expect(typeof row.profit).toBe('number');
    expect(row.profit).toBeCloseTo(999.99);
  });

  it('formats month as YYYY-MM', async () => {
    mockSql.mockResolvedValue([
      { month: new Date('2024-11-01T00:00:00Z'), profit: '0' },
    ]);

    const [row] = await resolver.monthlyProfit();

    expect(row.month).toMatch(/^\d{4}-\d{2}$/);
  });
});
